import { SpotifyUser, SpotifyPlaylist, SpotifyTrack } from './../Models';
import { arrayToObject } from './Utils';
import { getUser, getUserPlaylists, getPlaylistTracks, getFeaturesForTracks } from './Spotify';

const localStorageKey = 'emotionify-SpotifyDataStore';
const stateVersion = 1;

interface State {
    user: SpotifyUser | null,
    playlists: {
        [key: string]: SpotifyPlaylist
    },
    tracks: {
        [key: string]: SpotifyTrack
    }
}

interface Subscribers {
    [key: string]: (dataStoreState: State) => void
}

interface Storage {
    state: State,
    version: number
}

let blank_state: State = {
    user: null,
    playlists: {},
    tracks: {}
}

class SpotifyDataStore {
    private state: State = blank_state;
    private subscribers: Subscribers = {};

    constructor() {
        this.readStateFromLocalStorage();
    }

    private readStateFromLocalStorage() {
        // Read this objects state from local storage
        let stored_data = localStorage.getItem(localStorageKey);
        if (stored_data !== null) {
            let stored_data_parsed: Storage = JSON.parse(stored_data);
            if (stored_data_parsed.version === stateVersion) {
                this.state = stored_data_parsed.state;
                this.stateUpdated();
            }
        }
    }

    private putStateInLocalStorage() {
        // Put this objects state into local storage
        let data_to_store: Storage = {
            state: this.state,
            version: stateVersion
        }
        localStorage.setItem(localStorageKey, JSON.stringify(data_to_store));
    }

    private deleteStateFromLocalStorage() {
        // Delete this objects state from local storage
        localStorage.removeItem(localStorageKey);
    }

    subscribe(id: string, callback: (dataStoreState: State) => void): void {
        // Provide a callback for any state changes
        this.subscribers[id] = callback;
    }

    unsubscribe(id: string): void {
        // Remove the provided callback
        delete this.subscribers[id];
    }

    getState(): State {
        return this.state;
    }

    clearState(): void {
        // Remove all data and notify everyone
        this.state = blank_state;
        this.stateUpdated();
    }

    private stateUpdated(): void {
        // Call each callback provided passing the current state
        Object.values(this.subscribers).forEach(callback => {
            callback(this.state);
        })
    }

    requestUser(token: string): void {
        getUser(token)
            .then(user => {
                // Update the user in the state
                this.state.user = user;
                this.stateUpdated();
            });
    }

    requestPlaylists(token: string, user: SpotifyUser) {
        getUserPlaylists(token, user)
            .then(playlists => {
                // Created an indexed object of the playlists
                let playlists_indexed: {[key: string]: SpotifyPlaylist} = arrayToObject(playlists, 'id');

                // Store the playlists (this requests them all so no need to add onto what is already stored)
                this.state.playlists = playlists_indexed;
                this.stateUpdated();
            });
    }

    requestPlaylistTracks(token: string, playlist: SpotifyPlaylist) {
        getPlaylistTracks(token, playlist)
            .then(tracks => {
                // Filter out tracks we already have (to not overwrite data)
                let tracks_not_stored: SpotifyTrack[] = tracks.filter(track => !(track.id in this.state.tracks));

                // Get ids to store with playlist and created an indexed object of the tracks
                let track_ids: string[] = tracks_not_stored.map(t => t.id);
                let tracks_indexed: {[key: string]: SpotifyTrack} = arrayToObject(tracks_not_stored, 'id');

                // Store these tracks and store them with the playlist and 
                this.state.playlists = { ...this.state.playlists, [playlist.id]: {...this.state.playlists[playlist.id], track_ids: track_ids} };
                this.state.tracks = { ...this.state.tracks, ...tracks_indexed };
                this.stateUpdated();

                // Get audio features for any new tracks
                const track_ids_not_requested: string[] = Object.values(this.state.tracks)
                    .filter(track => track.audio_features === null)
                    .map(track => track.id);
                getFeaturesForTracks(token, track_ids_not_requested)
                    .then(data => {
                        // Map audio feature objects into track objects in the state and then convert the list into an object
                        let tracks_with_af: SpotifyTrack[] = data.map(f => {
                            return { ...this.state.tracks[f.id], audio_features: f}
                        });
                        let tracks_with_af_indexed: {[key: string]: SpotifyTrack} = arrayToObject(tracks_with_af, 'id');

                        // Update state with these updated tracks
                        this.state.tracks = {...this.state.tracks, ...tracks_with_af_indexed};
                        this.stateUpdated();
                    });

            })
    }
}

export default SpotifyDataStore;
