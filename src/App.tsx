import React, { useState, useEffect } from 'react';
import { useRoutes } from 'hookrouter';
import SpotifyWebApi from 'spotify-web-api-js';
import Navigation from './components/Navigation';
import TokenRefreshWarning from './components/TokenRefreshWarning';
import StoredDataDialog from './components/StoredDataDialog';
import SpotifyAuthorization from './pages/SpotifyAuthorization';
import Home from './pages/Home';
import About from './pages/About';
import Sort from './pages/Sort';
import NotFound from './pages/NotFound';
import { Token, SpotifyData, PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from './models/Spotify';
import { getAllSpotifyUsersPlaylists, getAllTracksInPlaylist, getAudioFeaturesForTracks } from './logic/Spotify';
import { arrayToObject } from './logic/Utils';

const localStorageKey = 'emotionify-app';

const emptySpotifyData = {
    user: undefined,
    playlists: {},
    tracks: {},
    audioFeatures: {}
}

interface IProps { }

interface IStorage {
    token: Token,
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds }
}

export const App: React.FunctionComponent<IProps> = (props: IProps) => {
    const [token, setToken] = useState<Token | undefined>(undefined);
    const [spotifyData, setSpotifyData] = useState<SpotifyData>(emptySpotifyData);
    const [storedDataDialogOpen, setStoredDataDialogOpen] = useState(false);

    const onTokenChange = (newToken: Token | undefined) => setToken(newToken);
    const onLogOut = () => onTokenChange(undefined);
    const openStoredDataDialog = () => setStoredDataDialogOpen(true);
    const closeStoredDataDialog = () => setStoredDataDialogOpen(false);

    const refreshUsersPlaylists = () => {
        if (token !== undefined && spotifyData.user !== undefined) {
            getAllSpotifyUsersPlaylists(token, spotifyData.user)
                .then(playlists => {
                    setSpotifyData({ 
                        ...spotifyData,
                        playlists: arrayToObject<PlaylistObjectSimplifiedWithTrackIds>(playlists, "id")
                    });
                })
                .catch(err => console.error(err));
        }
    }

    const refreshPlaylist = (playlist: SpotifyApi.PlaylistObjectSimplified) => {
        if (token !== undefined) {
            getAllTracksInPlaylist(token, playlist)
                .then(tracks => {
                    let new_tracks = tracks.filter(t => !(t.id in spotifyData.tracks));
                    setSpotifyData({ 
                        ...spotifyData,
                        tracks: { ...spotifyData.tracks, ...arrayToObject<TrackWithAudioFeatures>(new_tracks, "id") },
                        playlists: { 
                            ...spotifyData.playlists, 
                            [playlist.id]: { ...spotifyData.playlists[playlist.id], track_ids: tracks.map(t => t.id) } 
                        }
                    });
                })
                .catch(err => console.error(err));
        }
    }

    useEffect(() => { // Retrieve part of state from localStorage on startup
        let stored_data: string | null = localStorage.getItem(localStorageKey);

        if (stored_data !== null) {
            let stored_data_parsed: IStorage = JSON.parse(stored_data);
            stored_data_parsed.token.expiry = new Date(stored_data_parsed.token.expiry);
            if (stored_data_parsed.token.expiry > new Date()) {
                setToken(stored_data_parsed.token);
                setSpotifyData({ ...emptySpotifyData, user: stored_data_parsed.user, playlists: stored_data_parsed.playlists });
                refreshUsersPlaylists();
            }
        }
    }, []);

    useEffect(() => { // Store part of state in localStorage
        if (token !== undefined) {
            let data_to_store: IStorage = {
                token: token,
                user: spotifyData.user,
                playlists: arrayToObject<PlaylistObjectSimplifiedWithTrackIds>(Object.values(spotifyData.playlists).map(p => { return { ...p, track_ids: [] }}), "id") // Empty track_id lists in playlist objects
            }
            localStorage.setItem(localStorageKey, JSON.stringify(data_to_store));
        } else {
            localStorage.removeItem(localStorageKey);
        }
    }, [token, spotifyData.user, spotifyData.playlists]);

    useEffect(() => { // Request the user when the token changes
        if (token === undefined) {
            setSpotifyData({ ...spotifyData, user: undefined });
        } else {
            const spotifyApi = new SpotifyWebApi();
            spotifyApi.setAccessToken(token.value);
            spotifyApi.getMe()
                .then(user => {
                    if (spotifyData.user === undefined) { // If there is currently no user, clear the playlists and put the new user in
                        setSpotifyData({ ...spotifyData, playlists: {}, user: user });
                    } else if (spotifyData.user.id !== user.id) { // If this is a new user
                        setSpotifyData({ ...spotifyData, playlists: {}, user: user });
                    } else { // Same user, new token
                        setSpotifyData({ ...spotifyData, user: user });
                    }
                })
                .catch(err => console.error(err));
        }
    }, [token]);

    useEffect(() => { // Request playlists on user change
        if (spotifyData.user === undefined) {
            setSpotifyData({ ...spotifyData, playlists: {} });
        } else {
            refreshUsersPlaylists();
        }
    }, [spotifyData.user]);

    useEffect(() => { // Request audio features when needed
        const track_ids_with_no_audio_features: string[] = Object.values(spotifyData.tracks)
            .filter(t => t.audio_features === undefined)
            .map(t => t.id);

        if (token !== undefined && track_ids_with_no_audio_features.length > 0) {
            getAudioFeaturesForTracks(token, track_ids_with_no_audio_features)
                .then(audio_features => {
                    const tracks_with_new_audio_features: TrackWithAudioFeatures[] = audio_features.map(af => { return {...spotifyData.tracks[af.id], audio_features: af} });

                    setSpotifyData({
                        ...spotifyData,
                        tracks: { ...spotifyData.tracks, ...arrayToObject<TrackWithAudioFeatures>(tracks_with_new_audio_features, "id") }
                    });
                })
                .catch(err => console.error(err));
        }
    }, [spotifyData.tracks]);

    const routes = {
        '/': () => <Home />,
        '/spotify-authorization': () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
        '/spotify-authorization/': () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
        '/sort': () => <Sort token={token} user={spotifyData.user} playlists={spotifyData.playlists} tracks={spotifyData.tracks} refreshPlaylist={refreshPlaylist} refreshUsersPlaylists={refreshUsersPlaylists} />,
        '/about': () => <About />,
    };
    const routeResult = useRoutes(routes);

    return <>
        <TokenRefreshWarning token={token} onLogOut={onLogOut} />
        {token !== undefined && spotifyData.user !== undefined && storedDataDialogOpen && 
            <StoredDataDialog 
                token={token}
                user={spotifyData.user}
                playlists={spotifyData.playlists}
                tracks={spotifyData.tracks}
                onClose={closeStoredDataDialog} 
                onLogOut={onLogOut} 
            />
        }
        <Navigation user={spotifyData.user} onAuthButtonLoggedInClick={openStoredDataDialog} />
        {routeResult || <NotFound />}
    </>
}

export default App;
