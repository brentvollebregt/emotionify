import React from 'react';
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
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
    playlists: SpotifyApi.ListOfUsersPlaylistsResponse | null
}

class Sort extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)

        this.state = {
            requestingPlaylists: false,
            playlists: null
        }

        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        if (this.tokenExists() && this.tokenValid()) {
            this.setState({
                requestingPlaylists: true,
            });
            this.getUserPlaylists();
        }
    }

    tokenExists() {
        return this.props.token.value !== null;
    }

    tokenValid() {
        return this.props.token.expiry > new Date();
    }

    getUserPlaylists() {
        if (this.props.token.value !== null && this.props.user !== null) {
            let spotifyApi = new SpotifyWebApi();
            spotifyApi.setAccessToken(this.props.token.value);
            spotifyApi.getUserPlaylists(this.props.user.id, { limit: 5 })
                .then(data => {
                    this.setState({ playlists: data, requestingPlaylists: false })
                }, err => {
                    console.error(err);
                });
            
        } else {
            alert('Cannot request playlists, token or user not found');
        }
    }

    logout() {
        // Used for testing
    }

    render() {
        const header = <Container className="mb-4">
            <h1 className="text-center">Playlist Sort</h1>
            <p className="text-center lead col-md-7 mx-auto">Here you can select a playlist and look at how the new playlist is sorted. You can then create the new playlist or select a different playlist.</p>
        </Container>;

        if (!this.tokenExists()) { // Check if token exists
            return (
                <>
                    { header }
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
                    { header }
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
                    { header }
                    <Container className="text-center">
                        <Spinner animation="border" />
                        <p className="text-center">Loading Playlists</p>
                    </Container>
                </>
            )
        }

        return (
            <>
                { header }
                <Container className="text-center">
                    <p>
                        Logged in as: {this.props.user !== null ? this.props.user.display_name : ''}
                        <Button size="sm" className="ml-3" onClick={this.logout}>Logout</Button>
                    </p>
                    <h2>Select a Playlist</h2>
                </Container>
            </>
        )
    }
}

export default Sort;
