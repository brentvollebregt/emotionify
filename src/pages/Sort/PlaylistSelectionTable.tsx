import React from 'react';
import Table from 'react-bootstrap/Table';

interface PlaylistSelectionProps {
    playlists: SpotifyApi.PlaylistObjectSimplified[]
    onPlaylistSelected: (id: string) => void
}

const PlaylistSelection: React.SFC<PlaylistSelectionProps> = (props: PlaylistSelectionProps) => {
    return <>
        <h3 className="mb-3">Select a Playlist</h3>
        <Table responsive striped hover>
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th className="d-none d-md-block">Owner</th>
                    <th>Tracks</th>
                    <th className="d-none d-lg-block">Public</th>
                </tr>
            </thead>
            <tbody>
                {props.playlists.map(
                    playlist => (<tr key={playlist.id} onClick={e => props.onPlaylistSelected(playlist.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ padding: 2 }}><img src={playlist.images[0].url} style={{ height: 43 }} alt={'Artwork for: ' + playlist.name}/></td>
                        <td>{playlist.name}</td>
                        <td title={playlist.owner.uri} className="d-none d-md-block">{playlist.owner.display_name}</td>
                        <td>{playlist.tracks.total}</td>
                        <td className="d-none d-lg-block">{playlist.public ? 'Yes' : 'No'}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </>
}

export default PlaylistSelection;