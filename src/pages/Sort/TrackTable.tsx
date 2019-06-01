import React from 'react';
import Table from 'react-bootstrap/Table';
import { TrackWithAudioFeatures } from './index';
import { millisecondsToMinSec } from '../../Utils';

/*
* TODO:
*   - Arrows and numbers showing how much a song has moved in the playlist. Colour them to the dot that is on the graph
*   - Add support for sorting
*   - Add support for different x and y names
*   - Don't close when clicked (can I think of something better? - per row that is)
*/

interface TrackTableProps {
    tracks: TrackWithAudioFeatures[] // These are ordered when the come in
}

const TrackTable: React.SFC<TrackTableProps> = (props: TrackTableProps) => {
    return <>
        <Table responsive striped bordered size="sm">
            <thead>
                <tr>
                    <th>Moved</th>
                    <th>Title</th>
                    <th>Artists</th>
                    <th className="d-none d-lg-block">Length</th>
                    <th>Energy</th>
                    <th>Valence</th>
                </tr>
            </thead>
            <tbody>
                {props.tracks.map(
                    track => (<tr key={track.id}>
                        <td>&uArr; 0</td>
                        <td>{track.name}</td>
                        <td>{track.artists.map(a => a.name).join(', ')}</td>
                        <td className="d-none d-lg-block">{millisecondsToMinSec(track.duration_ms)}</td>
                        <td>{track.audioFeatures !== null ? track.audioFeatures.energy : 0}</td>
                        <td>{track.audioFeatures !== null ? track.audioFeatures.valence : 0}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </>
}

export default TrackTable;