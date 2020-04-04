import React from "react";
import Plot from "react-plotly.js";
import {
  PlaylistObjectSimplifiedWithTrackIds,
  availableTrackAudioFeatures,
  TrackWithAudioFeatures
} from "../../models/Spotify";
import { getSupportedTrackAudioFeaturesFromPlaylist } from "../../logic/Spotify";

const plotLimitExpand = 0.01; // To help get 0 and 1 grid lines

interface IProps {
  playlists: PlaylistObjectSimplifiedWithTrackIds[];
  tracks: { [key: string]: TrackWithAudioFeatures };
  x_audio_feature_name: string;
  y_audio_feature_name: string;
}

const ScatterPlotDualAudioFeatureComparison: React.FunctionComponent<IProps> = (props: IProps) => {
  const { playlists, tracks, x_audio_feature_name, y_audio_feature_name } = props;

  // Audio feature helpers
  const x_audio_feature = availableTrackAudioFeatures[x_audio_feature_name];
  const y_audio_feature = availableTrackAudioFeatures[y_audio_feature_name];

  // Audio feature objects that exist for the playlists provided
  const supportedTrackAudioFeaturesPerPlaylist: SpotifyApi.AudioFeaturesObject[][] = playlists.map(
    (playlist) => getSupportedTrackAudioFeaturesFromPlaylist(playlist, tracks)
  );

  // Max and min points in the data
  const all_x_values: number[] = supportedTrackAudioFeaturesPerPlaylist
    .map((playlistAudioFeatures) =>
      playlistAudioFeatures.map((af) => af[x_audio_feature.key] as number)
    )
    .flat();
  const all_y_values: number[] = supportedTrackAudioFeaturesPerPlaylist
    .map((playlistAudioFeatures) =>
      playlistAudioFeatures.map((af) => af[y_audio_feature.key] as number)
    )
    .flat();
  const points_x_min: number = Math.min(...all_x_values);
  const points_y_min: number = Math.min(...all_y_values);
  const points_x_max: number = Math.max(...all_x_values);
  const points_y_max: number = Math.max(...all_y_values);

  // The min and max are passed in, but still take the points into account just incase there are values outside of the defined range
  const scale_x_min: number | undefined =
    x_audio_feature.min !== undefined ? Math.min(x_audio_feature.min, points_x_min) : undefined;
  const scale_x_max: number | undefined =
    x_audio_feature.max !== undefined ? Math.max(x_audio_feature.max, points_x_max) : undefined;
  const scale_y_min: number | undefined =
    y_audio_feature.min !== undefined ? Math.min(y_audio_feature.min, points_y_min) : undefined;
  const scale_y_max: number | undefined =
    y_audio_feature.max !== undefined ? Math.max(y_audio_feature.max, points_y_max) : undefined;

  return (
    <Plot
      data={playlists.map((playlist: PlaylistObjectSimplifiedWithTrackIds, index: number) => ({
        x: supportedTrackAudioFeaturesPerPlaylist[index].map(
          (af) => af[x_audio_feature.key] as number
        ),
        y: supportedTrackAudioFeaturesPerPlaylist[index].map(
          (af) => af[y_audio_feature.key] as number
        ),
        text: supportedTrackAudioFeaturesPerPlaylist[index].map((af) => {
          const track = tracks[af.id];
          return (
            "Title: " +
            track.name +
            "<br>Artist: " +
            track.artists.map((a) => a.name).join(", ") +
            "<br>" +
            x_audio_feature_name +
            ": " +
            af[x_audio_feature.key] +
            "<br>" +
            y_audio_feature_name +
            ": " +
            af[y_audio_feature.key]
          );
        }),
        hoverinfo: "text",
        mode: "markers",
        marker: {
          size: 7
        },
        name: playlist.name
      }))}
      layout={{
        hovermode: "closest",
        margin: { t: 0, b: 0, l: 0, r: 0 },
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        xaxis: {
          range: [
            scale_x_min !== undefined ? scale_x_min - plotLimitExpand : undefined,
            scale_x_max !== undefined ? scale_x_max + plotLimitExpand : undefined
          ],
          zeroline: false
        },
        yaxis: {
          range: [
            scale_y_min !== undefined ? scale_y_min - plotLimitExpand : undefined,
            scale_y_max !== undefined ? scale_y_max + plotLimitExpand : undefined
          ],
          zeroline: false
        },
        legend: {
          orientation: "h"
        }
      }}
      useResizeHandler={true}
      config={{
        displayModeBar: false,
        responsive: true
      }}
      className="w-100 m-auto"
      style={{
        maxWidth: 700,
        height: 450
      }}
    />
  );
};

export default ScatterPlotDualAudioFeatureComparison;
