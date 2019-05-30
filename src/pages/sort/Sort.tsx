import React from 'react';
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import SpotifyWebApi from 'spotify-web-api-js';

interface IProps {
    token: {
        value: string | null,
        expiry: Date
    },
    user: SpotifyApi.CurrentUsersProfileResponse | null
}

interface IState {
    requestingPlaylists: boolean,
    playlists: SpotifyApi.PlaylistObjectSimplified[] | null
    selectedPlaylist: SpotifyApi.PlaylistObjectSimplified | null
}

class Sort extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)

        this.state = {
            requestingPlaylists: false,
            playlists: null,
            selectedPlaylist: null
        }

        this.playlistSelected = this.playlistSelected.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount(): void {
        if (this.tokenExists() && this.tokenValid()) {
            this.setState({
                requestingPlaylists: true,
            });
            this.getUserPlaylists();
        }
    }

    tokenExists(): boolean {
        return this.props.token.value !== null;
    }

    tokenValid(): boolean {
        return this.props.token.expiry > new Date();
    }

    getUserPlaylists(): void { // TODO Make recursive to get all playlists
        if (this.props.token.value !== null && this.props.user !== null) {
            let spotifyApi = new SpotifyWebApi();
            spotifyApi.setAccessToken(this.props.token.value);
            spotifyApi.getUserPlaylists(this.props.user.id, { limit: 5 })
                .then(data => {
                    this.setState({ playlists: data.items, requestingPlaylists: false });
                }, err => {
                    console.error(err);
                });

        } else {
            alert('Cannot request playlists, token or user not found');
        }
    }

    playlistSelected(playlist_id: string): void {
        if (this.state.playlists !== null) {
            let playlist = this.state.playlists.find(p => p.id === playlist_id);
            if (playlist !== undefined) {
                this.setState({ selectedPlaylist: playlist });
            }
        }
    }

    getSelectedPlaylistData(): void {
        // Ideal to cache this
        // Request for all tracks in the playlist
        // Request for song features for all of them
    }

    logout(): void {
        // Used for testing
        console.warn(this.state);
    }

    render() {
        const header = <Container className="mb-4">
            <h1 className="text-center">Playlist Sort</h1>
            <p className="text-center lead col-md-7 mx-auto">Here you can select a playlist and look at how the new playlist is sorted. You can then create the new playlist or select a different playlist.</p>
        </Container>;

        if (!this.tokenExists()) { // Check if token exists
            return (
                <>
                    {header}
                    <Container className="text-center">
                        <h2>Login to Spotify</h2>
                        <p>To get access to your playlists and the ability to create playlists, you need to sign into Spotify.</p>
                        <Link to="/spotify-authorization"><Button>Sign Into Spotify</Button></Link>
                    </Container>
                </>
            )
        }

        if (!this.tokenValid()) { // Check if token hasn't expired
            return (
                <>
                    {header}
                    <Container className="text-center">
                        <h2 className="text-center">Login to Spotify</h2>
                        <p className="text-center">A previously stored token has now expired; these tokens last for an hour. Please sign back into Spotify to get a new token and continue with sorting playlists.</p>
                        <Link to="/spotify-authorization"><Button>Sign Into Spotify</Button></Link>
                    </Container>
                </>
            )
        }

        // Check if loading
        if (this.state.requestingPlaylists) {
            return (
                <>
                    {header}
                    <Container className="text-center">
                        <Spinner animation="border" />
                        <p className="text-center">Loading Playlists</p>
                    </Container>
                </>
            )
        }

        const { playlists, selectedPlaylist } = this.state;
        const { user } = this.props;

        return (
            <>
                {header}
                <Container className="text-center">
                    <p>
                        Logged in as: {user !== null ? user.display_name : ''}
                        <Button size="sm" className="ml-3" onClick={this.logout}>Logout</Button>
                    </p>

                    <hr />

                    <h3 className="mt-4 mb-3">Select a Playlist</h3>
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
                            {playlists !== null && playlists.map(
                                playlist => (<tr key={playlist.id} onClick={e => this.playlistSelected(playlist.id)}>
                                    <td style={{ padding: 2 }}><img src={playlist.images[0].url} style={{ height: 43 }} alt={'Artwork for: ' + playlist.name}/></td>
                                    <td>{playlist.name}</td>
                                    <td title={playlist.owner.uri}>{playlist.owner.display_name}</td>
                                    <td>{playlist.tracks.total}</td>
                                    <td>{playlist.public ? 'Yes' : 'No'}</td>
                                </tr>)
                            )}
                        </tbody>
                    </Table>

                    <hr />

                    {selectedPlaylist && <div>
                        <h3 className="mt-4 mb-1">{selectedPlaylist.name}</h3>
                        <p>
                            <a href={selectedPlaylist.owner.href}>{selectedPlaylist.owner.display_name}</a>{' | '}
                            <span>Tracks: {selectedPlaylist.tracks.total}</span>{' | '}
                            <a href={selectedPlaylist.external_urls.spotify}>Spotify</a>{' | '}
                            <span>{selectedPlaylist.public ? 'Public' : 'Private'}</span>
                        </p>
                    </div>}

                </Container>
            </>
        )
    }
}

export default Sort;
