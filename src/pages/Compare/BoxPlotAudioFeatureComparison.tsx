import React from 'react';
import Plot from 'react-plotly.js';
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from '../../models/Spotify';

const plotLimitExpand = 0.01; // To help get 0 and 1 grid lines

interface IProps {
    selectedPlaylists: PlaylistObjectSimplifiedWithTrackIds[],
    tracks: { [key: string]: TrackWithAudioFeatures },
    audioFeature: keyof SpotifyApi.AudioFeaturesObject
    min: number | undefined,
    max: number | undefined
}

const BoxPlotAudioFeatureComparison: React.FunctionComponent<IProps> = (props: IProps) => {
    const { selectedPlaylists, tracks, audioFeature, max, min } = props;

    const supportedTrackAudioFeaturesFromPlaylist = (playlist: PlaylistObjectSimplifiedWithTrackIds): SpotifyApi.AudioFeaturesObject[] => {
        return playlist
            .track_ids // Get the playlists tracks
            .map(tid => tracks[tid].audio_features) // Get all audio features
            .filter((af): af is SpotifyApi.AudioFeaturesObject  => af !== undefined && af !== null); // Filter out invalid audio features
    }

    return <Plot
        data={selectedPlaylists.map((playlist: PlaylistObjectSimplifiedWithTrackIds) => ({
            x: supportedTrackAudioFeaturesFromPlaylist(playlist)
                .map(afs => afs[audioFeature]),
            type: "box",
            hoverinfo: "text",
            text: supportedTrackAudioFeaturesFromPlaylist(playlist)
                .map(af => tracks[af.id].name + '<br>by ' + tracks[af.id].artists.map(a => a.name).join(', ') ),
            name: playlist.name,
        }))}
        layout={{ 
            hovermode: "closest",
            margin: {t: 0, b: 0, l: 0, r: 5}, 
            xaxis: {
                range: [
                    min !== undefined ? min - plotLimitExpand : undefined, 
                    max !== undefined ? max + plotLimitExpand : undefined
                ],
                showgrid: true,
                zeroline: false
            },
            yaxis: {
                ticks: '',
                showticklabels: false
            },
            autosize: true,
            legend: {
                orientation: 'h',
            },
        }}
        useResizeHandler={true}
        config={{
            displayModeBar: false,
            responsive: true
        }}
        style={{
            width: '100%',
            maxWidth: 800,
            height: 50 + (selectedPlaylists.length * 60),
            margin: 'auto',
        }}
    />
}

export default BoxPlotAudioFeatureComparison;
