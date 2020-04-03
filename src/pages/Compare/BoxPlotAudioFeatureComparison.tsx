import React from "react";
import Plot from "react-plotly.js";
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from "../../models/Spotify";
import { getSupportedTrackAudioFeaturesFromPlaylist } from "../../logic/Spotify";

const plotLimitExpand = 0.01; // To help get 0 and 1 grid lines

interface IProps {
  selectedPlaylists: PlaylistObjectSimplifiedWithTrackIds[];
  tracks: { [key: string]: TrackWithAudioFeatures };
  audioFeature: keyof SpotifyApi.AudioFeaturesObject;
  min: number | undefined;
  max: number | undefined;
}

const BoxPlotAudioFeatureComparison: React.FunctionComponent<IProps> = (props: IProps) => {
  const { selectedPlaylists, tracks, audioFeature, max, min } = props;

  return (
    <Plot
      data={selectedPlaylists.map((playlist: PlaylistObjectSimplifiedWithTrackIds) => ({
        x: getSupportedTrackAudioFeaturesFromPlaylist(playlist, tracks).map(
          (afs) => afs[audioFeature]
        ),
        type: "box",
        hoverinfo: "text",
        text: getSupportedTrackAudioFeaturesFromPlaylist(playlist, tracks).map(
          (af) =>
            tracks[af.id].name + "<br>by " + tracks[af.id].artists.map((a) => a.name).join(", ")
        ),
        name: playlist.name
      }))}
      layout={{
        hovermode: "closest",
        margin: { t: 0, b: 0, l: 0, r: 5 },
        xaxis: {
          range: [
            min !== undefined ? min - plotLimitExpand : undefined,
            max !== undefined ? max + plotLimitExpand : undefined
          ],
          showgrid: true,
          zeroline: false
        },
        yaxis: {
          ticks: "",
          showticklabels: false
        },
        autosize: true,
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
        maxWidth: 800,
        height: 50 + selectedPlaylists.length * 60
      }}
    />
  );
};

export default BoxPlotAudioFeatureComparison;
