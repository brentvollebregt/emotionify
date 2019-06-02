import React from 'react';
import Table from 'react-bootstrap/Table';
import { millisecondsToMinSec } from '../../logic/Utils';
import { SortablePoint } from '../../logic/PointSorting';
import { ReducedSpotifyTrack, ReducedSpotifyTrackAudioFeatures } from '../../Models';

interface IProps {
    tracks: ReducedSpotifyTrack[], // These are ordered when they come in
    x_audio_feature: string,
    x_audio_feature_name: string,
    y_audio_feature: string,
    y_audio_feature_name: string,
    sorting_method: Function
}

interface ReducedSpotifyTrackAndPlaylistIndex extends ReducedSpotifyTrack {
    index: {
        before: number,
        after: number
    }
}

const TrackTable: React.SFC<IProps> = (props: IProps) => {
    // Get points initial indexes (to calculate movement)
    let tracks_with_playlist_indexes: ReducedSpotifyTrackAndPlaylistIndex[] = props.tracks.map((t, i) => {
        return { ...t, index: { before: i, after: 0 } };
    });

    // Sort points
    const isValidAudioFeature = (audioFeatures: ReducedSpotifyTrackAudioFeatures, audioFeature: string): audioFeature is keyof ReducedSpotifyTrackAudioFeatures => {
        return audioFeature in audioFeatures;
    };
    const isNumber = (value: any): value is number => {
        return typeof value === "number";
    };
    let tracks_as_sp: SortablePoint[] = props.tracks.map(t => {
        if (t.audio_features !== null 
            && isValidAudioFeature(t.audio_features, props.x_audio_feature) 
            && isValidAudioFeature(t.audio_features, props.y_audio_feature)
            && isNumber(t.audio_features[props.x_audio_feature])
            && isNumber(t.audio_features[props.y_audio_feature])
        ) {

            let x = t.audio_features[props.x_audio_feature];
            let y = t.audio_features[props.y_audio_feature];
            if (isNumber(x) && isNumber(y)) {
                return {
                    id: t.id, 
                    x: x,
                    y: y
                }
            } else {
                console.error('TrackTable/tracks_as_sp: Audio feature is a string for (' + props.x_audio_feature + ', ' + props.y_audio_feature + ') from ' + t.id);
                return {
                    id: t.id, 
                    x: 0,
                    y: 0
                }
            }

        } else {
            // Commonly occurs as t.audioFeatures === null on first playlist selection
            return {
                id: t.id, 
                x: 0,
                y: 0
            }
        }
    });
    let tracks_as_sp_sorted: SortablePoint[] = props.sorting_method(tracks_as_sp);

    // Calculate new indexes using the sorted points
    let tracks_with_sorted_indexes: ReducedSpotifyTrackAndPlaylistIndex[] = tracks_as_sp_sorted.map((sp, i) => {
        let track = tracks_with_playlist_indexes.find(t => t.id === sp.id);
        if (track !== undefined) {
            return { ...track, index: { before: track.index.before, after: i } };
        } else {
            console.error('[TrackTable:tracks_with_sorted_indexes] Cannot find match for: ' + sp.id);
            return null;
        }
    }).filter((t: ReducedSpotifyTrackAndPlaylistIndex | null): t is ReducedSpotifyTrackAndPlaylistIndex => t !== null);

    // Sort tracks by the new indexes
    let tracks_sorted: ReducedSpotifyTrackAndPlaylistIndex[] = tracks_with_sorted_indexes.sort((a, b) => a.index.after - b.index.after);

    const header_cell_style: React.CSSProperties = {
        position: 'sticky',
        top: 0,
        background: 'white',
        borderTop: 0
    }

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
                {tracks_sorted.map(
                    track => (<tr key={track.id}>
                        <td style={track.index.after - track.index.before === 0 ? {color: 'black'} : track.index.after - track.index.before < 0 ? {color: 'green'} : {color: 'red'}}>
                            {track.index.before - track.index.after}
                        </td>
                        <td>{track.name}</td>
                        <td className="d-none d-md-table-cell">{track.artists.map(a => a.name).join(', ')}</td>
                        <td className="d-none d-lg-table-cell">{millisecondsToMinSec(track.duration_ms)}</td>
                        <td>{track.audio_features !== null && isValidAudioFeature(track.audio_features, props.x_audio_feature) ? track.audio_features[props.x_audio_feature] : 0}</td>
                        <td>{track.audio_features !== null && isValidAudioFeature(track.audio_features, props.y_audio_feature) ? track.audio_features[props.y_audio_feature] : 0}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </div>
}

export default TrackTable;
