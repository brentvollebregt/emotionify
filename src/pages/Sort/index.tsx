import React from 'react';
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { getUserPlaylists, getPlaylistTracks, getFeaturesForTracks } from '../../Spotify';
import { Token } from '../../Models';
import PlaylistSelection from './PlaylistSelection'
import SelectedPlaylist from './SelectedPlaylist'
import Plot, { Point } from './Plot'

const local_storage_sort_component_state_key = 'emotionify-sort-component-state';

interface IProps {
    token: Token | null,
    user: SpotifyApi.CurrentUsersProfileResponse | null,
    onLogout: () => void
}

interface IState {
    requestingPlaylists: boolean,
    requestingTracks: boolean,
    playlists: SpotifyApi.PlaylistObjectSimplified[]
    selectedPlaylist: SpotifyApi.PlaylistObjectSimplified | null,
    playlistTracks: {
        [key: string]: SpotifyApi.TrackObjectFull[]
    }
    audioFeatures: SpotifyApi.AudioFeaturesObject[],
    plotData: Point[]
}

let blank_state: IState = {
    requestingPlaylists: false,
    requestingTracks: false,
    playlists: [],
    selectedPlaylist: null,
    playlistTracks: {},
    audioFeatures: [],
    plotData: []
}

class Sort extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)

        let stored_state = this.getStoredState();
        if (stored_state === null) {
            this.state = blank_state;
        } else {
            this.state = stored_state;
        }

        this.playlistSelected = this.playlistSelected.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount(): void {
        const { token, user } = this.props;

        if (token !== null && token.expiry > new Date() && user !== null) {
            if (this.state.playlists.length === 0) { // Only request if there are no playlists stored
                this.setState({
                    requestingPlaylists: true,
                });
    
                getUserPlaylists(token.value, user)
                    .then(playlists => {
                        this.setState({ 
                            requestingPlaylists: false, 
                            playlists 
                        }, this.storeState);
                    }, err => {
                        console.error(err);
                        alert('Cannot request playlists, token or user not found');
                    });
            }
        }
    }

    storeState(): void {
        localStorage.setItem(local_storage_sort_component_state_key, JSON.stringify(this.state));
    }

    getStoredState(): IState | null {
        let stored_data = localStorage.getItem(local_storage_sort_component_state_key);
        if (stored_data === null) {
            return null;
        } else {
            return JSON.parse(stored_data);
        }
    }

    deleteStoredState(): void {
        localStorage.removeItem(local_storage_sort_component_state_key);
    }

    playlistSelected(playlist_id: string): void {
        if (this.state.playlists.length > 0) {
            let playlist = this.state.playlists.find(p => p.id === playlist_id);
            if (playlist !== undefined) {
                const non_undefined_playlist = playlist; // To keep the TS compiler happy
                this.setState({ 
                    selectedPlaylist: non_undefined_playlist,
                    plotData: []
                }, () => this.getPlaylistTracks(non_undefined_playlist));
                this.setPlotData(); // Attempt to set plot data with what we already know
            }
        }
    }

    getPlaylistTracks(playlist: SpotifyApi.PlaylistObjectSimplified): void {
        if (this.props.token !== null && !(playlist.id in this.state.playlistTracks)) { // Check if we already have the data
            this.setState({ requestingTracks: true });
            getPlaylistTracks(this.props.token.value, playlist)
                .then(tracks => {
                    this.setState({ 
                        playlistTracks: { ...this.state.playlistTracks, [playlist.id]: tracks }
                        }, () => this.getTrackFeatures(tracks.map(t => t.id)));
                }, err => {
                    console.error(err);
                });
        }
    }

    getTrackFeatures(track_ids: string[]): void {
        if (this.props.token !== null) {
            const currently_sotred_track_ids_with_features = this.state.audioFeatures.map(af => af.id);
            const track_ids_not_requested = track_ids.filter(t => !(t in currently_sotred_track_ids_with_features));

            getFeaturesForTracks(this.props.token.value, track_ids_not_requested)
                .then(data => {
                    this.setState({ 
                        audioFeatures: [...this.state.audioFeatures, ...data],
                        requestingTracks: false // Now that we have all track data required
                    }, this.setPlotData); // Call setPlotData now that we have the required data
                }, err => {
                    console.error(err);
                });
        }
    }

    setPlotData(): void {
        const { selectedPlaylist } = this.state

        if (selectedPlaylist !== null) {
            
        }
    }

    logout(): void {
        this.deleteStoredState();
        this.setState(blank_state);
        this.props.onLogout();
    }

    render() {
        const header = <Container className="mt-3 mb-4">
            <h1 className="text-center" onClick={() => {console.warn(this.state)}}>Playlist Sort</h1>
            <p className="text-center lead col-md-7 mx-auto">Here you can select a playlist and look at how the new playlist is sorted. You can then create the new playlist or select a different playlist.</p>
        </Container>;

        if (this.props.token === null) { // Check if token exists
            return (<>
                    {header}
                    <Container className="text-center">
                        <h2>Login to Spotify</h2>
                        <p>To get access to your playlists and the ability to create playlists, you need to sign into Spotify.</p>
                        <Link to="/spotify-authorization"><Button>Sign Into Spotify</Button></Link>
                    </Container>
            </>)
        }

        if (this.props.token.expiry <= new Date()) { // Check if token hasn't expired
            return (<>
                    {header}
                    <Container className="text-center">
                        <h2 className="text-center">Login to Spotify</h2>
                        <p className="text-center">A previously stored token has now expired; these tokens last for an hour. Please sign back into Spotify to get a new token and continue with sorting playlists.</p>
                        <Link to="/spotify-authorization"><Button>Sign Into Spotify</Button></Link>
                    </Container>
            </>)
        }

        const { playlists, selectedPlaylist, requestingPlaylists, plotData } = this.state;
        const { user } = this.props;

        return (<>
            {header}
            <Container className="text-center mb-5">
                <p>
                    Logged in as: {user !== null ? user.display_name : ''}
                    <Button size="sm" className="ml-3" onClick={this.logout}>Logout</Button>
                </p>

                <hr />

                {playlists && <PlaylistSelection playlists={playlists} onPlaylistSelected={this.playlistSelected} />}
                {requestingPlaylists && <Spinner animation="border" />}

                <hr />

                {selectedPlaylist !== null && <>
                    <SelectedPlaylist playlist={selectedPlaylist}/>
                    <Plot points={plotData}/>
                </>}

            </Container>
        </>)
    }
}

export default Sort;
