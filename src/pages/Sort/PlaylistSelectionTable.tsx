import React from 'react';
import Table from 'react-bootstrap/Table';
import { PlaylistObjectSimplifiedWithTrackIds } from '../../models/Spotify';

interface IProps {
    playlists: PlaylistObjectSimplifiedWithTrackIds[],
    selectedPlaylist: string | undefined,
    onPlaylistSelected: (id: string) => void
}

const PlaylistSelection: React.FunctionComponent<IProps> = (props: IProps) => {
    const {playlists, selectedPlaylist, onPlaylistSelected} = props;

    return <>
        <h3 className="mb-3">Select a Playlist</h3>
        <Table responsive striped hover>
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th className="d-none d-md-table-cell">Owner</th>
                    <th>Tracks</th>
                    <th className="d-none d-lg-table-cell">Public</th>
                </tr>
            </thead>
            <tbody>
                {playlists.map(playlist => <tr key={playlist.id} onClick={e => onPlaylistSelected(playlist.id)} style={{ cursor: 'pointer', background: selectedPlaylist === playlist.id ? 'linear-gradient(to right, rgba(0, 82, 157, 0.3), rgba(235, 18, 27, 0.3))' : undefined }}>
                    <td style={{ padding: 2 }}>{playlist.images.length > 0 && <img src={playlist.images[0].url} style={{ height: 43 }} alt={'Artwork for: ' + playlist.name}/>}</td>
                    <td>{playlist.name}</td>
                    <td title={playlist.owner.uri} className="d-none d-md-table-cell">{playlist.owner.display_name}</td>
                    <td>{playlist.tracks.total}</td>
                    <td className="d-none d-lg-table-cell">{playlist.public ? 'Yes' : 'No'}</td>
                </tr>)}
            </tbody>
        </Table>
    </>
}

export default PlaylistSelection;
