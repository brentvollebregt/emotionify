import React from 'react';
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { getUserPlaylists, getPlaylistTracks, getFeaturesForTracks, createPlaylist } from '../../logic/Spotify';
import { Token } from '../../Models';
import { arrayToObject } from '../../logic/Utils';
import PlaylistSelection from './PlaylistSelectionTable';
import PlaylistDetails from './PlaylistDetails';
import Plot from './Plot';
import TrackTable from './TrackTable';
import TrackSortControl from './TrackSortControl';
import AccordionDynamicHeader from './AccordionDynamicHeader';
import Export from './Export';
import { availableSortingMethods, IndexedTrackId, sort, SpotifyTrackWithIndexes } from '../../logic/PointSorting';
import { putStoredState, getStoredState, deleteStoredState } from '../../logic/StateStore';
import { SpotifyUser, SpotifyPlaylist, SpotifyTrack } from '../../Models';

const local_storage_key: string = 'emotionify-app-sort';
const available_audio_features: {[key: string]: string} = {
    'Acousticness': 'acousticness',
    'Danceability': 'danceability',
    'Duration': 'duration_ms',
    'Energy': 'energy',
    'Instrumentalness': 'instrumentalness',
    'Key': 'key',
    'Liveness': 'liveness',
    'Loudness': 'loudness',
    'Mode': 'mode',
    'Speechiness': 'speechiness',
    'Tempo': 'tempo',
    'Time Signature' : 'time_signature',
    'Valence': 'valence'
};

interface IProps {
    token: Token | null,
    user: SpotifyUser | null,
    onLogout: () => void
}

interface IState {
    requestingPlaylists: boolean,
    requestingTracks: boolean,
    playlists: {
        [key: string]: SpotifyPlaylist
    },
    tracks: {
        [key: string]: SpotifyTrack
    }
    selectedPlaylist: string | null,
    selectedAxis: {
        x: string,
        y: string
    },
    selectedSortingMethod: string,
    sortedTrackIds: IndexedTrackId[]
}

interface IStorage {
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
        x: 'Energy',
        y: 'Valence',
    },
    selectedSortingMethod: 'Distance From Origin',
    sortedTrackIds: []
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
        this.onExport = this.onExport.bind(this);
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
                        let playlists_indexed: {[key: string]: SpotifyPlaylist} = arrayToObject(playlists, 'id');
                        this.setState({ 
                            requestingPlaylists: false, 
                            playlists: playlists_indexed
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
            let data_to_store: IStorage = {
                user_id: this.props.user.id,
                state: this.state
            }
            putStoredState(local_storage_key, data_to_store);
        }
    }

    getStoredState(user_id: string): IState | null {
        let storage = getStoredState(local_storage_key, (state: IStorage): boolean => {
            return state.user_id === user_id; // Only get a stored state if it relates to the current user
        });
        return storage === null ? null : storage.state;
    }

    deleteStoredState(): void {
        deleteStoredState(local_storage_key);
    }

    onPlaylistSelected(playlist_id: string): void {
        if (playlist_id in this.state.playlists) {
            let playlist = this.state.playlists[playlist_id];
            this.setState({
                selectedPlaylist: playlist_id
            }, () => {
                this.getPlaylistTracks(playlist);
                this.sortTracks();
            });
        }
    }

    getPlaylistTracks(playlist: SpotifyPlaylist): void {
        if (this.props.token !== null && playlist.tracks.total !== playlist.track_ids.length) { // Check if we already have the data
            this.setState({ requestingTracks: true });
            getPlaylistTracks(this.props.token.value, playlist)
                .then(tracks => {
                    let track_ids: string[] = tracks.map(t => t.id);
                    let tracks_with_audio_features: SpotifyTrack[] = tracks.map(t => {return {...t, audioFeatures: null}});
                    let tracks_with_audio_features_indexed: {[key: string]: SpotifyTrack} = arrayToObject(tracks_with_audio_features, 'id');
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
            const currently_sotred_track_ids_with_features = Object.values(this.state.tracks).filter(t => t.audio_features !== null).map(af => af.id);
            const track_ids_not_requested = track_ids.filter(t => !(t in currently_sotred_track_ids_with_features));

            getFeaturesForTracks(this.props.token.value, track_ids_not_requested)
                .then(data => {
                    const { tracks } = this.state;
                    let features_merged_with_tracks: SpotifyTrack[] = data.map(f => {
                        return { ...tracks[f.id], audio_features: f}
                    });
                    let features_merged_with_tracks_indexed: {[key: string]: SpotifyTrack} = arrayToObject(features_merged_with_tracks, 'id');

                    this.setState({ 
                        tracks: {...this.state.tracks, ...features_merged_with_tracks_indexed},
                        requestingTracks: false // Now that we have all track data required
                    }, () => {
                        this.storeState();
                        this.sortTracks();
                    });
                }, err => {
                    console.error(err);
                });
        }
    }

    onXAxisSelect(selection: string): void {
        this.setState({ selectedAxis: {...this.state.selectedAxis, x: selection} }, this.sortTracks);
    }

    onYAxisSelect(selection: string): void {
        this.setState({ selectedAxis: {...this.state.selectedAxis, y: selection} }, this.sortTracks);
    }

    onSortMethodSelect(selection: string): void {
        this.setState({ selectedSortingMethod: selection }, this.sortTracks);
    }

    sortTracks(): void {
        const { playlists, tracks, selectedPlaylist, selectedAxis, selectedSortingMethod } = this.state;

        if (selectedPlaylist !== null) {
            let selected_playlist_track_ids: string[] = playlists[selectedPlaylist].track_ids;
            let selected_playlist_tracks: SpotifyTrack[] = Object.values(tracks)
                .filter(t => selected_playlist_track_ids.indexOf(t.id) !== -1)
                .sort((a: SpotifyTrack, b: SpotifyTrack): number => { // Do a sort to put them in the correct order again (fixes incorrect order of overlapping playlists)
                    let aIndex = selected_playlist_track_ids.indexOf(a.id);
                    let bIndex = selected_playlist_track_ids.indexOf(b.id);
                    return aIndex === bIndex 
                        ? 0
                        : aIndex > bIndex ? 1 : -1
                });
            this.setState({
                sortedTrackIds: sort(selected_playlist_tracks, available_audio_features[selectedAxis.x], available_audio_features[selectedAxis.y], availableSortingMethods[selectedSortingMethod])
            }, this.storeState); // Store the state otherwise this will be blank on rehydration
        }
    }

    async onExport(name: string, isPublic: boolean): Promise<boolean> {
        const { token, user } = this.props;
        if (token !== null && user !== null) {
            // Map the sorted tracks to uris
            let track_uris: string[] = this.state.sortedTrackIds.map(st => this.state.tracks[st.id].uri);
            // Create the playlist
            let success: boolean = await createPlaylist(token.value, user, name, isPublic, track_uris)
                .then(playlist => {
                    this.setState({ playlists: {...this.state.playlists, [playlist.id] : playlist} }, this.storeState); // Add the new playlist
                    return true;
                }, err => {
                    console.error(err);
                    return false;
                });
            return success;
        }
        return false;
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

        const { playlists, tracks, selectedPlaylist, requestingPlaylists, requestingTracks, selectedAxis, selectedSortingMethod, sortedTrackIds } = this.state;
        const { user } = this.props;

        // Map the sorted data back to tracks to display
        // TODO: Coule be mapped into state?
        let sorted_spotify_tracks: SpotifyTrackWithIndexes[] = sortedTrackIds.map(st => {return {...st, ...tracks[st.id]}});

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
                    <div className="mb-4">
                        <PlaylistDetails playlist={playlists[selectedPlaylist]} />
                    </div>

                    <div className="mb-4">
                        {requestingTracks && <Spinner animation="border" className="my-3" />}
                        <Plot tracks={sorted_spotify_tracks} />
                    </div>

                    <div className="mb-3">
                        <TrackSortControl 
                            available_audio_features={Object.keys(available_audio_features)} 
                            available_track_sorting_methods={Object.keys(availableSortingMethods)}
                            selected_x_axis={selectedAxis.x}
                            selected_y_axis={selectedAxis.y}
                            selected_sorting_method={selectedSortingMethod}
                            onXAxisSelect={this.onXAxisSelect}
                            onYAxisSelect={this.onYAxisSelect}
                            onSortMethodSelect={this.onSortMethodSelect}
                        />
                    </div>

                    {!requestingTracks && playlists[selectedPlaylist].tracks.total !== sorted_spotify_tracks.length && 
                        <Alert variant="warning" style={{display: 'inline-block'}}>
                            Warning: Duplicates in this playlist will be removed
                        </Alert>
                    }

                    <div className="mb-5">
                        <AccordionDynamicHeader
                            name={'tracks'}
                            contractedHeader={'Songs in Playlist (click to expand)'}
                            expandedHeader={'Songs in Playlist (click to collapse)'}
                            initiallyExpanded={false}
                        >
                            <TrackTable 
                                tracks={sorted_spotify_tracks}
                                x_audio_feature={available_audio_features[selectedAxis.x]}
                                x_audio_feature_name={selectedAxis.x}
                                y_audio_feature={available_audio_features[selectedAxis.y]}
                                y_audio_feature_name={selectedAxis.y}
                            />
                        </AccordionDynamicHeader>
                    </div>

                    <div className="mb-5">
                        <Export onExport={this.onExport}/>
                    </div>
                </>}

            </Container>
        </>)
    }
}

export default Sort;
