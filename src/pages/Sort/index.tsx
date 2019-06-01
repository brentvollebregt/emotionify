import React from 'react';
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { getUserPlaylists, getPlaylistTracks, getFeaturesForTracks } from '../../logic/Spotify';
import { Token } from '../../Models';
import { arrayToObject } from '../../logic/Utils';
import PlaylistSelection from './PlaylistSelectionTable';
import SelectedPlaylist from './SelectedPlaylist';
import Plot from './Plot';
import TrackTable from './TrackTable';
import TrackSortControl, { AudioFeatureNamePair, SortingMethodNamePair } from './TrackSortControl';
import { originDistance, nearestNeighbourFromOrigin } from '../../logic/PointSorting';

const local_storage_sort_component_state_key: string = 'emotionify-sort-component-state';
const available_audio_features: AudioFeatureNamePair[] = [
    { audioFeature: 'acousticness', name: 'Acousticness' },
    { audioFeature: 'danceability', name: 'Danceability' },
    { audioFeature: 'duration_ms', name: 'Duration' },
    { audioFeature: 'energy', name: 'Energy' },
    { audioFeature: 'instrumentalness', name: 'Instrumentalness' },
    { audioFeature: 'key', name: 'Key' },
    { audioFeature: 'liveness', name: 'Liveness' },
    { audioFeature: 'loudness', name: 'Loudness' },
    { audioFeature: 'mode', name: 'Mode' },
    { audioFeature: 'speechiness', name: 'Speechiness' },
    { audioFeature: 'tempo', name: 'Tempo' },
    { audioFeature: 'time_signature', name: 'Time Signature' },
    { audioFeature: 'valence', name: 'Valence' }
];
const available_track_sorting_algorithms: SortingMethodNamePair[] = [
    { method: originDistance, name: 'Distance From Origin' },
    { method: nearestNeighbourFromOrigin, name: 'Nearest Neighbour' }
];

interface IProps {
    token: Token | null,
    user: SpotifyApi.CurrentUsersProfileResponse | null,
    onLogout: () => void
}

interface IState {
    requestingPlaylists: boolean,
    requestingTracks: boolean,
    playlists: {
        [key: string]: PlaylistWithTracks
    },
    tracks: {
        [key: string]: TrackWithAudioFeatures
    }
    selectedPlaylist: string | null,
    selectedAxis: {
        x: AudioFeatureNamePair,
        y: AudioFeatureNamePair
    },
    selectedSortingMethod: SortingMethodNamePair
}

interface PlaylistWithTracks extends SpotifyApi.PlaylistObjectSimplified {
    track_ids: string[]
}

export interface TrackWithAudioFeatures extends SpotifyApi.TrackObjectFull {
    audioFeatures: SpotifyApi.AudioFeaturesObject | null
}

interface SortStorage {
    user_id: string,
    state: IState
}

let blank_state: IState = {
    requestingPlaylists: false,
    requestingTracks: false,
    playlists: {},
    tracks: {},
    selectedPlaylist: null,
    selectedAxis: {
        x: { audioFeature: 'energy', name: 'Energy' },
        y: { audioFeature: 'valence', name: 'Valence' },
    },
    selectedSortingMethod: { method: originDistance, name: 'Distance From Origin' }
}

class Sort extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)

        if (props.user !== null) {
            let stored_state = this.getStoredState(props.user.id);
            if (stored_state !== null) {
                this.state = stored_state;
            } else {
                this.state = blank_state;
            }
        } else {
            this.state = blank_state;
        }

        this.onPlaylistSelected = this.onPlaylistSelected.bind(this);
        this.onXAxisSelect = this.onXAxisSelect.bind(this);
        this.onYAxisSelect = this.onYAxisSelect.bind(this);
        this.onSortMethodSelect = this.onSortMethodSelect.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount(): void {
        const { token, user } = this.props;

        if (token !== null && token.expiry > new Date() && user !== null) {
            if (Object.entries(this.state.playlists).length === 0) { // Only request if there are no playlists stored
                this.setState({
                    requestingPlaylists: true,
                });
    
                getUserPlaylists(token.value, user)
                    .then(playlists => {
                        let playlists_with_tracks: PlaylistWithTracks[] = playlists.map(p => {return {...p, track_ids: []}});
                        let playlists_with_tracks_indexed: {[key: string]: PlaylistWithTracks} = arrayToObject(playlists_with_tracks, 'id');
                        this.setState({ 
                            requestingPlaylists: false, 
                            playlists: playlists_with_tracks_indexed
                        }, this.storeState);
                    }, err => {
                        console.error(err);
                        alert('Cannot request playlists, token or user not found');
                    });
            }
        }
    }

    storeState(): void {
        if (this.props.user !== null) {
            let data_to_store: SortStorage = {
                user_id: this.props.user.id,
                state: this.state
            }
            localStorage.setItem(local_storage_sort_component_state_key, JSON.stringify(data_to_store));
        }
    }

    getStoredState(user_id: string): IState | null {
        let stored_data = localStorage.getItem(local_storage_sort_component_state_key);
        if (stored_data === null) {
            return null;
        } else {
            let stored_data_parsed: SortStorage = JSON.parse(stored_data);
            if (stored_data_parsed.user_id === user_id) { // Only get a stored state if it relates to the current user
                return stored_data_parsed.state;
            } else {
                return null;
            }
        }
    }

    deleteStoredState(): void {
        localStorage.removeItem(local_storage_sort_component_state_key);
    }

    onPlaylistSelected(playlist_id: string): void {
        if (playlist_id in this.state.playlists) {
            let playlist = this.state.playlists[playlist_id];
            this.setState({
                selectedPlaylist: playlist_id
            }, () => {
                this.getPlaylistTracks(playlist);
            });
        }
    }

    getPlaylistTracks(playlist: PlaylistWithTracks): void {
        if (this.props.token !== null && playlist.tracks.total !== playlist.track_ids.length) { // Check if we already have the data
            this.setState({ requestingTracks: true });
            getPlaylistTracks(this.props.token.value, playlist)
                .then(tracks => {
                    let track_ids: string[] = tracks.map(t => t.id);
                    let tracks_with_audio_features: TrackWithAudioFeatures[] = tracks.map(t => {return {...t, audioFeatures: null}});
                    let tracks_with_audio_features_indexed: {[key: string]: TrackWithAudioFeatures} = arrayToObject(tracks_with_audio_features, 'id');
                    this.setState({ 
                        playlists: { ...this.state.playlists, [playlist.id]: {...this.state.playlists[playlist.id], track_ids: track_ids} }, // Put track ids in this playlist
                        tracks: { ...this.state.tracks, ...tracks_with_audio_features_indexed } // Insert tracks
                        }, () => this.getTrackFeatures(tracks.map(t => t.id)));
                }, err => {
                    console.error(err);
                });
        }
    }

    getTrackFeatures(track_ids: string[]): void {
        if (this.props.token !== null) {
            const currently_sotred_track_ids_with_features = Object.values(this.state.tracks).filter(t => t.audioFeatures !== null).map(af => af.id);
            const track_ids_not_requested = track_ids.filter(t => !(t in currently_sotred_track_ids_with_features));

            getFeaturesForTracks(this.props.token.value, track_ids_not_requested)
                .then(data => {
                    const { tracks } = this.state;
                    let features_merged_with_tracks: TrackWithAudioFeatures[] = data.map(f => {
                        return { ...tracks[f.id], audioFeatures: f}
                    });
                    let features_merged_with_tracks_indexed: {[key: string]: TrackWithAudioFeatures} = arrayToObject(features_merged_with_tracks, 'id');

                    this.setState({ 
                        tracks: {...this.state.tracks, ...features_merged_with_tracks_indexed},
                        requestingTracks: false // Now that we have all track data required
                    }, () => this.storeState);
                }, err => {
                    console.error(err);
                });
        }
    }

    onXAxisSelect(selection: AudioFeatureNamePair): void {
        this.setState({ selectedAxis: {...this.state.selectedAxis, x: selection} });
    }

    onYAxisSelect(selection: AudioFeatureNamePair): void {
        this.setState({ selectedAxis: {...this.state.selectedAxis, y: selection} });
    }

    onSortMethodSelect(selection: SortingMethodNamePair): void {
        this.setState({ selectedSortingMethod: selection });
    }

    logout(): void {
        this.deleteStoredState();
        this.setState(blank_state);
        this.props.onLogout();
    }

    render() {
        const header = <Container className="mt-3 mb-4">
            <h1 className="text-center" onClick={() => {console.log('this.props:', this.props, 'this.state:', this.state)}}>Playlist Sort</h1>
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

        const { playlists, selectedPlaylist, requestingPlaylists, requestingTracks, selectedAxis, selectedSortingMethod } = this.state;
        const { user } = this.props;

        let selected_playlist_tracks: TrackWithAudioFeatures[] = [];
        if (selectedPlaylist !== null) { // TODO: Fix: There is a bug here when selecting the "Liked from Radio" playlist
            let selected_playlist_track_ids: string[] = this.state.playlists[selectedPlaylist].track_ids;
            selected_playlist_tracks = Object.values(this.state.tracks).filter(t => selected_playlist_track_ids.indexOf(t.id) !== -1);
        }

        return (<>
            {header}
            <Container className="text-center mb-5">
                <p>
                    Logged in as: {user !== null ? user.display_name : ''}
                    <Button size="sm" className="ml-3" onClick={this.logout}>Logout</Button>
                </p>

                <hr />

                {playlists && <PlaylistSelection playlists={Object.values(playlists)} onPlaylistSelected={this.onPlaylistSelected} />}
                {requestingPlaylists && <Spinner animation="border" />}

                <hr />

                {selectedPlaylist !== null && <>
                    <div className="mb-2">
                        <SelectedPlaylist playlist={playlists[selectedPlaylist]} />
                    </div>

                    <div className="mb-3">
                        <TrackSortControl 
                            available_audio_features={available_audio_features} 
                            available_track_sorting_methods={available_track_sorting_algorithms}
                            selected_x_axis={selectedAxis.x}
                            selected_y_axis={selectedAxis.y}
                            selected_sorting_method={selectedSortingMethod}
                            onXAxisSelect={this.onXAxisSelect}
                            onYAxisSelect={this.onYAxisSelect}
                            onSortMethodSelect={this.onSortMethodSelect}
                        />
                    </div>
                    

                    {requestingTracks && <Spinner animation="border" className="my-3" />}
                    <div className="mb-3">
                        <Plot tracks={selected_playlist_tracks} />
                    </div>

                    <Accordion defaultActiveKey="0">
                        <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="songs">Songs in Playlist</Accordion.Toggle>
                            <Accordion.Collapse eventKey="songs">
                                <Accordion.Toggle as={Card.Body} eventKey="songs" className="p-0" style={{ cursor: 'padding' }}>
                                    <TrackTable 
                                        tracks={selected_playlist_tracks}
                                        selected_x_axis={selectedAxis.x}
                                        selected_y_axis={selectedAxis.y}
                                        selected_sorting_method={selectedSortingMethod}
                                    />
                                </Accordion.Toggle>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                </>}

            </Container>
        </>)
    }
}

export default Sort;
