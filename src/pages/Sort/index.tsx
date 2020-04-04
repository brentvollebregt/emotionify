import React, { useState, useEffect, useRef } from "react";
import { Alert, Container } from "react-bootstrap";
import {
  availableSortingMethods,
  IndexedTrackId,
  sort,
  SpotifyTrackWithIndexes
} from "../../logic/PointSorting";
import { createPlaylist } from "../../logic/Spotify";
import {
  PlaylistObjectSimplifiedWithTrackIds,
  availableTrackAudioFeatures,
  TrackWithAudioFeatures
} from "../../models/Spotify";
import { Token } from "../../models/Spotify";
import PlaylistSelection from "../../components/PlaylistSelection";
import PlaylistDetails from "../../components/PlaylistDetails";
import PlotTracks from "./PlotTracks";
import TrackTable from "./TrackTable";
import TrackSortControl from "./TrackSortControl";
import ExportPlaylistInput from "../../components/ExportPlaylistInput";
import SpotifyLoginStatusButton from "../../components/SpotifyLoginStatusButton";

interface IProps {
  token: Token | undefined;
  user: SpotifyApi.UserObjectPrivate | undefined;
  playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds };
  tracks: { [key: string]: TrackWithAudioFeatures };
  playlistsLoading: Set<string>;
  refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void;
  refreshUsersPlaylists: (hard: boolean) => void;
}

interface selectedAxis {
  x: string;
  y: string;
}

export const Sort: React.FunctionComponent<IProps> = (props: IProps) => {
  const { token, user, playlists, tracks, playlistsLoading } = props;
  const { refreshPlaylist, refreshUsersPlaylists } = props;

  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);
  const [selectedAxis, setSelectedAxis] = useState<selectedAxis>({ x: "Valence", y: "Energy" });
  const [sortingMethod, setSortingMethod] = useState<string>("Distance From Origin");
  const [sortedTrackIds, setSortedTrackIds] = useState<IndexedTrackId[]>([]);
  const [firstPlaylistSelection, setFirstPlaylistSelection] = useState(true);
  const playlistDetailsWrapperNode = useRef<HTMLHeadingElement | null>(null);

  const onPlaylistSelectionChange = (
    playlist_ids: string[],
    scrollOnFirstSelection: boolean = false
  ) => {
    setSelectedPlaylistIds(playlist_ids);
    playlist_ids.forEach((playlist_id) => {
      if (playlists[playlist_id].track_ids.length === 0) {
        refreshPlaylist(playlists[playlist_id]);
      }
    });
    // Scroll on first selection
    if (scrollOnFirstSelection && firstPlaylistSelection) {
      setTimeout(() => {
        if (playlistDetailsWrapperNode.current !== null) {
          window.scroll({
            top:
              playlistDetailsWrapperNode.current.getBoundingClientRect().top + window.scrollY - 50,
            behavior: "smooth"
          });
        }
      }, 300); // Wait for elements below to appear
    }
    setFirstPlaylistSelection(false);
  };
  const onXAxisSelect = (selection: string) => setSelectedAxis({ ...selectedAxis, x: selection });
  const onYAxisSelect = (selection: string) => setSelectedAxis({ ...selectedAxis, y: selection });
  const onSortMethodSelect = (selection: string) => setSortingMethod(selection);

  useEffect(() => {
    if (selectedPlaylistIds.length > 0) {
      const selected_playlist_track_ids: string[] = selectedPlaylistIds
        .map((pid) => (pid in playlists ? playlists[pid].track_ids : []))
        .flat();
      const selected_playlist_tracks: TrackWithAudioFeatures[] = Object.values(tracks)
        .filter((t) => selected_playlist_track_ids.indexOf(t.id) !== -1)
        .sort((a: TrackWithAudioFeatures, b: TrackWithAudioFeatures): number => {
          // Do a sort to put them in the correct order again (fixes incorrect order due to overlapping playlists)
          const aIndex = selected_playlist_track_ids.indexOf(a.id);
          const bIndex = selected_playlist_track_ids.indexOf(b.id);
          return aIndex === bIndex ? 0 : aIndex > bIndex ? 1 : -1;
        });
      setSortedTrackIds(
        sort(
          selected_playlist_tracks,
          availableTrackAudioFeatures[selectedAxis.x].key,
          availableTrackAudioFeatures[selectedAxis.y].key,
          availableSortingMethods[sortingMethod]
        )
      );
    } else {
      setSortedTrackIds([]);
    }
  }, [selectedPlaylistIds, selectedAxis, sortingMethod, playlists, tracks]);

  const sortedTrackIdsThatExist = sortedTrackIds.filter((t) => tracks[t.id] !== undefined); // Need to check if the tracks currently exist (some of these track id's don't match to tracks when selecting different playlists quickly)
  const sorted_tracks: TrackWithAudioFeatures[] = sortedTrackIdsThatExist.map((t) => tracks[t.id]);
  const sorted_tracks_with_indexes: SpotifyTrackWithIndexes[] = sortedTrackIdsThatExist.map(
    (it) => {
      return { ...tracks[it.id], ...it };
    }
  );

  const onExport = (name: string, isPublic: boolean): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      if (token !== undefined && sortedTrackIds !== undefined && user !== undefined) {
        // Map the sorted tracks to uris
        let track_uris: string[] = sortedTrackIds.map((st) => tracks[st.id].uri);
        // Create the playlist
        let success: boolean = await createPlaylist(
          token.value,
          user,
          name,
          isPublic,
          track_uris
        ).then(
          (playlist) => {
            refreshUsersPlaylists(false); // Get the new playlist by refreshing the playlist list (keep current track ids to not loose plot data)
            return true;
          },
          (err) => {
            console.error(err);
            return false;
          }
        );
        resolve(success);
      }
      resolve(false);
    });
  };

  const header = (
    <Container className="mt-3 mb-4">
      <h1 className="text-center">Playlist Sorting</h1>
      <p className="text-center lead col-md-7 mx-auto">
        Here you can select a playlist and look at how the new playlist is sorted. You can then
        create the new playlist or select a different playlist.
      </p>
    </Container>
  );

  if (token === undefined) {
    return (
      <>
        {header}
        <Container className="text-center">
          <h2>Sign into Spotify</h2>
          <p>
            To get access to your playlists and the ability to create playlists, you need to sign
            into Spotify.
          </p>
          <SpotifyLoginStatusButton user={user} />
        </Container>
      </>
    );
  }

  return (
    <>
      {header}
      <Container className="text-center mb-5">
        <h3 className="mb-3">Select a Playlist</h3>
        <PlaylistSelection
          playlists={Object.values(playlists)}
          selectedPlaylistIds={selectedPlaylistIds}
          selectionsAllowed="All"
          defaultSelectionType="Single"
          onPlaylistSelectionChange={onPlaylistSelectionChange}
        />

        {selectedPlaylistIds.length > 0 && (
          <>
            <hr />

            <div className="mb-4" ref={playlistDetailsWrapperNode}>
              <PlaylistDetails
                playlists={selectedPlaylistIds
                  .map((pid) => (pid in playlists ? playlists[pid] : null))
                  .filter(
                    (
                      p: PlaylistObjectSimplifiedWithTrackIds | null
                    ): p is PlaylistObjectSimplifiedWithTrackIds => p !== null
                  )}
                tracksLoading={selectedPlaylistIds
                  .map((pid) => playlistsLoading.has(pid))
                  .reduce((a, b) => a || b)}
              />
            </div>

            <div className="mb-3">
              <PlotTracks
                tracks={sorted_tracks}
                x_audio_feature_name={selectedAxis.x}
                y_audio_feature_name={selectedAxis.y}
              />
            </div>

            <div className="mb-3">
              <TrackSortControl
                available_audio_features={Object.keys(availableTrackAudioFeatures).filter(
                  (audio_feature_name) =>
                    availableTrackAudioFeatures[audio_feature_name].show_in_sort
                )}
                available_track_sorting_methods={Object.keys(availableSortingMethods)}
                selected_x_axis={selectedAxis.x}
                selected_y_axis={selectedAxis.y}
                selected_sorting_method={sortingMethod}
                onXAxisSelect={onXAxisSelect}
                onYAxisSelect={onYAxisSelect}
                onSortMethodSelect={onSortMethodSelect}
              />
            </div>

            {selectedPlaylistIds
              .map((pid) => (pid in playlists ? playlists[pid].track_ids.length : 0))
              .reduce((a, b) => a + b) > 0 &&
              selectedPlaylistIds
                .map((pid) => (pid in playlists ? playlists[pid].tracks.total : 0))
                .reduce((a, b) => a + b) !== sortedTrackIds.length && (
                <Alert variant="warning" className="d-inline-block">
                  Warning: Duplicate songs will be removed in the new playlist
                </Alert>
              )}

            <div className="mb-5">
              <TrackTable
                tracks={sorted_tracks_with_indexes}
                x_audio_feature={availableTrackAudioFeatures[selectedAxis.x].key}
                x_audio_feature_name={selectedAxis.x}
                y_audio_feature={availableTrackAudioFeatures[selectedAxis.y].key}
                y_audio_feature_name={selectedAxis.y}
              />
            </div>

            <div className="mb-5">
              <ExportPlaylistInput onExport={onExport} />
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default Sort;
