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
                    <th>Owner</th>
                    <th>Tracks</th>
                    <th>Public</th>
                </tr>
            </thead>
            <tbody>
                {props.playlists.map(
                    playlist => (<tr key={playlist.id} onClick={e => props.onPlaylistSelected(playlist.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ padding: 2 }}><img src={playlist.images[0].url} style={{ height: 43 }} alt={'Artwork for: ' + playlist.name}/></td>
                        <td>{playlist.name}</td>
                        <td title={playlist.owner.uri}>{playlist.owner.display_name}</td>
                        <td>{playlist.tracks.total}</td>
                        <td>{playlist.public ? 'Yes' : 'No'}</td>
                    </tr>)
                )}
            </tbody>
        </Table>
    </>
}

PlaylistSelection.defaultProps = {
    playlists: []
}

export default PlaylistSelection;