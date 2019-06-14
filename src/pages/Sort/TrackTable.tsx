import React from 'react';
import Table from 'react-bootstrap/Table';
import { millisecondsToMinSecString } from '../../logic/Utils';
import { SpotifyTrackWithIndexes } from '../../logic/PointSorting';
import { SpotifyTrackAudioFeatures } from '../../Models';

interface IProps {
    tracks: SpotifyTrackWithIndexes[], // These are sorted using the current method when they come in
    x_audio_feature: string,
    x_audio_feature_name: string,
    y_audio_feature: string,
    y_audio_feature_name: string
}

const header_cell_style: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    background: 'white',
    borderTop: 0
}

const isValidAudioFeature = (audioFeatures: SpotifyTrackAudioFeatures, audioFeature: string): audioFeature is keyof SpotifyTrackAudioFeatures => {
    return audioFeature in audioFeatures;
};

const TrackTable: React.SFC<IProps> = (props: IProps) => {
    return <div style={{maxHeight: 400, overflowY: 'auto', borderTop: '1px solid #dee2e6'}}>
        <Table bordered striped size="sm" style={{borderTop: 0}}>
            <thead>
                <tr>
                    <th style={header_cell_style}>Moved</th>
                    <th style={header_cell_style}>Title</th>
                    <th style={header_cell_style} className="d-none d-md-table-cell">Artists</th>
                    <th style={header_cell_style} className="d-none d-lg-table-cell">Length</th>
                    <th style={header_cell_style}>{props.x_audio_feature_name}</th>
                    <th style={header_cell_style}>{props.y_audio_feature_name}</th>
                </tr>
            </thead>
            <tbody>
                {props.tracks.map(
                    track => (<tr key={track.id}>
                        <td style={track.index.after - track.index.before === 0 ? {color: 'black'} : track.index.after - track.index.before < 0 ? {color: 'green'} : {color: 'red'}}>
                            {track.index.before - track.index.after}
                        </td>
                        <td>{track.name}</td>
                        <td className="d-none d-md-table-cell">{track.artists.map(a => a.name).join(', ')}</td>
                        <td className="d-none d-lg-table-cell">{millisecondsToMinSecString(track.duration_ms)}</td>
                        <td>{track.audio_features !== null && isValidAudioFeature(track.audio_features, props.x_audio_feature) ? track.audio_features[props.x_audio_feature] : 0}</td>
                        <td>{track.audio_features !== null && isValidAudioFeature(track.audio_features, props.y_audio_feature) ? track.audio_features[props.y_audio_feature] : 0}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </div>
}

export default TrackTable;
