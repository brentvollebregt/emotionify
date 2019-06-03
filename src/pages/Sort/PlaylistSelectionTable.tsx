import React from 'react';
import Table from 'react-bootstrap/Table';
import { SpotifyPlaylist } from '../../Models';

interface IProps {
    playlists: SpotifyPlaylist[]
    onPlaylistSelected: (id: string) => void
}

const PlaylistSelection: React.SFC<IProps> = (props: IProps) => {
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
                {props.playlists.map(
                    playlist => (<tr key={playlist.id} onClick={e => props.onPlaylistSelected(playlist.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ padding: 2 }}>{playlist.images.length > 0 && <img src={playlist.images[0]} style={{ height: 43 }} alt={'Artwork for: ' + playlist.name}/>}</td>
                        <td>{playlist.name}</td>
                        <td title={playlist.owner.uri} className="d-none d-md-table-cell">{playlist.owner.display_name}</td>
                        <td>{playlist.tracks.total}</td>
                        <td className="d-none d-lg-table-cell">{playlist.public ? 'Yes' : 'No'}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </>
}

export default PlaylistSelection;
