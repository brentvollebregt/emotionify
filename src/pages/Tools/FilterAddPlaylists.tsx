import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import PlaylistSelection from "../../components/PlaylistSelection";
import { FilterFunctionProps } from "./filter";
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from "../../models/Spotify";

interface IProps extends FilterFunctionProps {
  playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds };
  tracks: { [key: string]: TrackWithAudioFeatures };
  playlistsLoading: Set<string>;
  refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void;
}

const FilterAddPlaylists: React.FunctionComponent<IProps> = (props: IProps) => {
  const { playlists, tracks, playlistsLoading, refreshPlaylist, outputCallback } = props;

  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

  useEffect(() => {
    // Pass up new function on change
    const selectedPlaylistTracks: TrackWithAudioFeatures[] = selectedPlaylistIds
      .map((pid) => playlists[pid].track_ids)
      .map((tids) => tids.map((tid) => tracks[tid]))
      .flat();
    outputCallback(
      (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] => [
        ...tracks,
        ...selectedPlaylistTracks
      ],
      `${selectedPlaylistIds.length} Playlist${
        selectedPlaylistIds.length !== 1 ? "s" : ""
      } Selected`
    );
  }, [selectedPlaylistIds, playlists, tracks]);

  const onPlaylistSelectionChange = (playlist_ids: string[]) => {
    setSelectedPlaylistIds(playlist_ids);
    playlist_ids.forEach((playlist_id) => {
      if (playlists[playlist_id].track_ids.length === 0) {
        refreshPlaylist(playlists[playlist_id]);
      }
    });
  };

  return (
    <>
      <PlaylistSelection
        playlists={Object.values(playlists)}
        selectedPlaylistIds={selectedPlaylistIds}
        selectionsAllowed="All"
        defaultSelectionType="Single"
        onPlaylistSelectionChange={onPlaylistSelectionChange}
      />
      {playlistsLoading.size > 0 && (
        <div className="mt-3 d-flex align-items-center justify-content-center">
          <Spinner animation="border" />
          <span className="ml-3">Loading tracks for selected playlists</span>
        </div>
      )}
    </>
  );
};

export default FilterAddPlaylists;
