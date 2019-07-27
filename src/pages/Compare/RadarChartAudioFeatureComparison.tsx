import React from 'react';
import { PlaylistObjectSimplifiedWithTrackIds, availableTrackAudioFeatures, TrackWithAudioFeatures } from '../../models/Spotify';
import Plot from 'react-plotly.js';

interface IProps {
    playlists: PlaylistObjectSimplifiedWithTrackIds[],
    tracks: { [key: string]: TrackWithAudioFeatures },
}

const RadarChartAudioFeatureComparison: React.FunctionComponent<IProps> = (props: IProps) => {
    const { playlists, tracks } = props;

    const availableTrackAudioFeatureNames = Object.keys(availableTrackAudioFeatures).filter(af_name => availableTrackAudioFeatures[af_name].show_in_compare_radar);

    const calculateTrackAverageForAudioFeatures = (playlist: PlaylistObjectSimplifiedWithTrackIds, audio_feature: keyof SpotifyApi.AudioFeaturesObject): number => {
        const avaiableAudioFeatures = playlist.track_ids
            .map(tid => tracks[tid].audio_features)
            .filter((af): af is SpotifyApi.AudioFeaturesObject  => af !== undefined && af !== null);
        const audioFeatureValues = avaiableAudioFeatures.map(af => af[audio_feature] as number);
        const average = audioFeatureValues.reduce((p: number, c: number) => p + c, 0) / audioFeatureValues.length;
        return average;
    }

    return <Plot 
        data={playlists.map(playlist => ({
            type: 'scatterpolar',
            r: availableTrackAudioFeatureNames.map(af_name => calculateTrackAverageForAudioFeatures(playlist, availableTrackAudioFeatures[af_name].key)),
            theta: availableTrackAudioFeatureNames,
            fill: 'toself',
            name: playlist.name
        }))}
        layout={{
            hovermode: 'closest',
            margin: {t: 20},
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
            margin: 'auto',
            height: 400
        }}
    />
}

export default RadarChartAudioFeatureComparison;
