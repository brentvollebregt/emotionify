import React from 'react';
import Table from 'react-bootstrap/Table';
import { TrackWithAudioFeatures } from './index';
import { millisecondsToMinSec } from '../../Utils';

interface TrackTableProps {
    tracks: TrackWithAudioFeatures[]
}

const TrackTable: React.SFC<TrackTableProps> = (props: TrackTableProps) => {
    return <>
        <Table responsive striped size="sm">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Artists</th>
                    <th>Length</th>
                    <th>Energy</th>
                    <th>Valence</th>
                </tr>
            </thead>
            <tbody>
                {props.tracks.map(
                    track => (<tr key={track.id}>
                        <td>{track.name}</td>
                        <td>{track.artists.map(a => a.name).join(', ')}</td>
                        <td>{millisecondsToMinSec(track.duration_ms)}</td>
                        <td>{track.audioFeatures !== null ? track.audioFeatures.energy : 0}</td>
                        <td>{track.audioFeatures !== null ? track.audioFeatures.valence : 0}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </>
}

export default TrackTable;