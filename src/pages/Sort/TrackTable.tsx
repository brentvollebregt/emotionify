import React from 'react';
import Table from 'react-bootstrap/Table';
import { TrackWithAudioFeatures } from './index';
import { millisecondsToMinSec } from '../../logic/Utils';
import { SortablePoint, originDistance as sortedByOriginDistance } from '../../logic/PointSorting';

/*
* TODO:
*   - Add support for different x and y names
*   - Don't close when clicked (can I think of something better? - per row that is)
*/

interface TrackTableProps {
    tracks: TrackWithAudioFeatures[] // These are ordered when the come in
}

interface TrackWithAudioFeaturesAndPlaylistIndex extends TrackWithAudioFeatures {
    index: {
        before: number,
        after: number
    }
}

const TrackTable: React.SFC<TrackTableProps> = (props: TrackTableProps) => {
    // Get points initial indexes (to calculate movement)
    let tracks_with_playlist_indexes: TrackWithAudioFeaturesAndPlaylistIndex[] = props.tracks.map((t, i) => {
        return { ...t, index: { before: i, after: 0 } };
    });

    // Sort points
    let tracks_as_sp: SortablePoint[] = props.tracks.map(t => {
        return {
            id: t.id, 
            x: t.audioFeatures !== null ? t.audioFeatures.valence : 0, 
            y: t.audioFeatures !== null ? t.audioFeatures.energy : 0
        }
    });
    let tracks_as_sp_sorted: SortablePoint[] = sortedByOriginDistance(tracks_as_sp);

    // Calculate new indexes using the sorted points
    let tracks_with_sorted_indexes: TrackWithAudioFeaturesAndPlaylistIndex[] = tracks_as_sp_sorted.map((sp, i) => {
        let track = tracks_with_playlist_indexes.find(t => t.id === sp.id);
        if (track !== undefined) {
            return { ...track, index: { before: track.index.before, after: i } };
        } else {
            console.error('[TrackTable:tracks_with_sorted_indexes] Cannot find match for: ' + sp.id);
            return null;
        }
    }).filter((t: TrackWithAudioFeaturesAndPlaylistIndex | null): t is TrackWithAudioFeaturesAndPlaylistIndex => t !== null);

    // Sort tracks by the new indexes
    let tracks_sorted: TrackWithAudioFeaturesAndPlaylistIndex[] = tracks_with_sorted_indexes.sort((a, b) => a.index.after - b.index.after);

    return <>
        <Table responsive striped bordered size="sm">
            <thead>
                <tr>
                    <th>Moved</th>
                    <th>Title</th>
                    <th className="d-none d-md-table-cell">Artists</th>
                    <th className="d-none d-lg-table-cell">Length</th>
                    <th>Energy</th>
                    <th>Valence</th>
                </tr>
            </thead>
            <tbody>
                {tracks_sorted.map(
                    track => (<tr key={track.id}>
                        <td style={track.index.after - track.index.before === 0 ? {color: 'black'} : track.index.after - track.index.before < 0 ? {color: 'green'} : {color: 'red'}}>{track.index.before - track.index.after}</td>
                        <td>{track.name}</td>
                        <td className="d-none d-md-table-cell">{track.artists.map(a => a.name).join(', ')}</td>
                        <td className="d-none d-lg-table-cell">{millisecondsToMinSec(track.duration_ms)}</td>
                        <td>{track.audioFeatures !== null ? track.audioFeatures.energy : 0}</td>
                        <td>{track.audioFeatures !== null ? track.audioFeatures.valence : 0}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </>
}

export default TrackTable;