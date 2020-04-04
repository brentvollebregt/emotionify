import React, { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PlaylistSelection from "../../components/PlaylistSelection";
import SpotifyLoginStatusButton from "../../components/SpotifyLoginStatusButton";
import NamedDropdown from "../../components/NamedDropdown";
import BoxPlotAudioFeatureComparison from "./BoxPlotAudioFeatureComparison";
import ScatterPlotDualAudioFeatureComparison from "./ScatterPlotDualAudioFeatureComparison";
import RadarChartAudioFeatureComparison from "./RadarChartAudioFeatureComparison";
import {
  PlaylistObjectSimplifiedWithTrackIds,
  availableTrackAudioFeatures,
  TrackWithAudioFeatures
} from "../../models/Spotify";

interface IProps {
  user: SpotifyApi.UserObjectPrivate | undefined;
  playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds };
  tracks: { [key: string]: TrackWithAudioFeatures };
  playlistsLoading: Set<string>;
  refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void;
}

const Compare: React.FunctionComponent<IProps> = (props: IProps) => {
  const { user, playlists, tracks, playlistsLoading, refreshPlaylist } = props;

  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);
  const [oneDimensionComparisonAudioFeature, setOneDimensionComparisonAudioFeature] = useState(
    "Valence"
  );
  const [twoDimensionComparisonAudioFeatureX, setTwoDimensionComparisonAudioFeatureX] = useState(
    "Valence"
  );
  const [twoDimensionComparisonAudioFeatureY, setTwoDimensionComparisonAudioFeatureY] = useState(
    "Energy"
  );

  const onPlaylistSelectionChange = (playlist_ids: string[]) => {
    setSelectedPlaylistIds(playlist_ids);
    playlist_ids.forEach((playlist_id) => {
      if (playlists[playlist_id].track_ids.length === 0) {
        refreshPlaylist(playlists[playlist_id]);
      }
    });
  };

  const selectedPlaylists = selectedPlaylistIds.map((pid) => playlists[pid]);

  const header = (
    <Container className="mt-3 mb-4">
      <h1 className="text-center">Compare Playlists</h1>
      <p className="text-center lead col-md-7 mx-auto">
        Select playlists and compare them on one audio feature, two audio features or seven
        pre-selected audio features.
      </p>
    </Container>
  );

  if (user === undefined) {
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
          selectionsAllowed="Multiple"
          onPlaylistSelectionChange={onPlaylistSelectionChange}
        />

        {playlistsLoading.size > 0 && (
          <div className="my-4">
            <Spinner animation="border" />
          </div>
        )}

        {selectedPlaylistIds.length > 0 && (
          <>
            <hr />

            <div className="mb-5">
              <h4 className="mb-3">Single Audio Feature Comparison</h4>

              <NamedDropdown
                available_values={Object.keys(availableTrackAudioFeatures)}
                selected_value={oneDimensionComparisonAudioFeature}
                title="Audio Feature"
                onSelect={setOneDimensionComparisonAudioFeature}
                className="mb-3"
              />

              <BoxPlotAudioFeatureComparison
                selectedPlaylists={selectedPlaylists}
                tracks={tracks}
                audioFeature={availableTrackAudioFeatures[oneDimensionComparisonAudioFeature].key}
                min={availableTrackAudioFeatures[oneDimensionComparisonAudioFeature].min}
                max={availableTrackAudioFeatures[oneDimensionComparisonAudioFeature].max}
              />
            </div>

            <div className="mb-5">
              <h4 className="mb-3">Dual Audio Feature Comparison</h4>

              <div className="mb-3">
                <NamedDropdown
                  available_values={Object.keys(availableTrackAudioFeatures)}
                  selected_value={twoDimensionComparisonAudioFeatureX}
                  title="X-Axis ( ↔ )"
                  onSelect={setTwoDimensionComparisonAudioFeatureX}
                  className="mr-3"
                />

                <NamedDropdown
                  available_values={Object.keys(availableTrackAudioFeatures)}
                  selected_value={twoDimensionComparisonAudioFeatureY}
                  title="Y-Axis ( ↕ )"
                  onSelect={setTwoDimensionComparisonAudioFeatureY}
                />
              </div>

              <ScatterPlotDualAudioFeatureComparison
                playlists={selectedPlaylists}
                tracks={tracks}
                x_audio_feature_name={twoDimensionComparisonAudioFeatureX}
                y_audio_feature_name={twoDimensionComparisonAudioFeatureY}
              />
            </div>

            <div className="mb-5">
              <h4 className="mb-3">0-1 Range Audio Feature Comparison</h4>

              <RadarChartAudioFeatureComparison playlists={selectedPlaylists} tracks={tracks} />
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default Compare;
