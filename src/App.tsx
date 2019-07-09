import React, { useState, useEffect } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import SpotifyWebApi from 'spotify-web-api-js';
import cogoToast from 'cogo-toast';
import Navigation from './components/Navigation';
import TokenRefreshWarning from './components/TokenRefreshWarning';
import StoredDataDialog from './components/StoredDataDialog';
import SpotifyAuthorization from './pages/SpotifyAuthorization';
import Home from './pages/Home';
import About from './pages/About';
import Sort from './pages/Sort';
import NotFound from './pages/NotFound';
import useNavigatorOnline from './hooks/NavigatorOnline';
import { Token, SpotifyData, PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from './models/Spotify';
import { getAllSpotifyUsersPlaylists, getAllTracksInPlaylist, getAudioFeaturesForTracks } from './logic/Spotify';
import { arrayToObject } from './logic/Utils';

const localStorageKey = 'emotionify-app';
const storageVersion = 1;

const emptySpotifyData = {
    user: undefined,
    playlists: {},
    tracks: {},
    audioFeatures: {}
}

interface IProps { }

interface IStorage {
    version: number,
    token: Token,
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds }
}

export const App: React.FunctionComponent<IProps> = (props: IProps) => {
    const [token, setToken] = useState<Token | undefined>(undefined);
    const [spotifyData, setSpotifyData] = useState<SpotifyData>(emptySpotifyData);
    const [storedDataDialogOpen, setStoredDataDialogOpen] = useState(false);
    const [playlistsLoading, setPlaylistsLoading] = useState<Set<string>>(new Set());
    const isOnline = useNavigatorOnline();

    const onTokenChange = (newToken: Token | undefined) => setToken(newToken);
    const onLogOut = () => onTokenChange(undefined);
    const openStoredDataDialog = () => setStoredDataDialogOpen(true);
    const closeStoredDataDialog = () => setStoredDataDialogOpen(false);

    const refreshUsersPlaylists = (hard: boolean = true) => {
        if (token !== undefined && spotifyData.user !== undefined) {
            getAllSpotifyUsersPlaylists(token, spotifyData.user)
                .then(playlists => {
                    // Remove all requested playlist track ids if we are refreshing hard
                    setSpotifyData({ 
                        ...spotifyData,
                        playlists: { ...arrayToObject<PlaylistObjectSimplifiedWithTrackIds>(playlists.map(p => p.id in spotifyData.playlists && !hard ? { ...p, track_ids: spotifyData.playlists[p.id].track_ids } : p), "id") }
                    });
                })
                .catch(err => cogoToast.error(
                    'Could not get your playlists. Make sure you are connected to the internet and that your token is valid.',
                    { position: "bottom-center", heading: 'Error When Fetching Playlists', hideAfter: 20, onClick: (hide: any) => hide() }
                ));
        }
    }

    const refreshPlaylist = (playlist: SpotifyApi.PlaylistObjectSimplified) => {
        if (token !== undefined && !playlistsLoading.has(playlist.id) ) {
            setPlaylistsLoading(new Set([ ...Array.from(playlistsLoading), playlist.id ]));
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
                .catch(err => cogoToast.error(
                    `Could not get songs for the playlist "${playlist.name}". Make sure you are connected to the internet and that your token is valid.`,
                    { position: "bottom-center", heading: 'Error When Fetching Playlist\'s Songs', hideAfter: 20, onClick: (hide: any) => hide() }
                ))
                .finally(() => setPlaylistsLoading(new Set([ ...Array.from(playlistsLoading).filter(p => p !== playlist.id) ])));
        }
    }

    useEffect(() => { // Retrieve part of state from localStorage on startup
        let stored_data: string | null = localStorage.getItem(localStorageKey);
        if (stored_data !== null) {
            try {
                const stored_data_parsed: IStorage = JSON.parse(stored_data);
                stored_data_parsed.token.expiry = new Date(stored_data_parsed.token.expiry);
                if (stored_data_parsed.version === storageVersion && stored_data_parsed.token.expiry > new Date()) {
                    setToken(stored_data_parsed.token);
                    setSpotifyData({ ...emptySpotifyData, user: stored_data_parsed.user, playlists: stored_data_parsed.playlists });
                    refreshUsersPlaylists();
                }
            } catch {
                console.error('Failed to read state from localStorage');
            }
        }
    }, []);

    useEffect(() => { // Store part of state in localStorage
        if (token !== undefined) {
            let data_to_store: IStorage = {
                version: storageVersion,
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
                .catch(err => cogoToast.error(
                    'Could not get your profile. Make sure you are connected to the internet and that your token is valid.',
                    { position: "bottom-center", heading: 'Error When Fetching Your Profile', hideAfter: 20, onClick: (hide: any) => hide() }
                ));
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
                .then((audio_features: (SpotifyApi.AudioFeaturesObject | null)[]) => { // Some tracks will return null audio features
                    // Check if any tracks do not have audio features
                    const audio_features_by_track_id = arrayToObject<SpotifyApi.AudioFeaturesObject>(audio_features.filter((af): af is SpotifyApi.AudioFeaturesObject => af !== null), "id");
                    const tracks_with_new_audio_features: TrackWithAudioFeatures[] = track_ids_with_no_audio_features.map(tid => ({
                        ...spotifyData.tracks[tid], 
                        audio_features: tid in audio_features_by_track_id ? audio_features_by_track_id[tid] : null
                    }));

                    // Show a warning if there were tracks with no audio features
                    const null_audio_feature_tracks = tracks_with_new_audio_features.filter(t => t.audio_features === null);
                    if (null_audio_feature_tracks.length > 0) {
                        console.warn(`Some audio features are null: ${null_audio_feature_tracks.map(t => t.id).join(', ')}`);
                    }

                    setSpotifyData({
                        ...spotifyData,
                        tracks: { ...spotifyData.tracks, ...arrayToObject<TrackWithAudioFeatures>(tracks_with_new_audio_features, "id") }
                    });
                })
                .catch(err => cogoToast.error(
                    'Could not get audio features for some songs. Make sure you are connected to the internet and that your token is valid.',
                    { position: "bottom-center", heading: 'Error When Fetching Song Audio Features', hideAfter: 20, onClick: (hide: any) => hide() }
                ));
        }
    }, [spotifyData.tracks]);

    useEffect(() => { // Display a warning when offline
        if (!isOnline) {
            cogoToast.warn(
                'You are now offline. You will not be able to request data from Spotify unless you are connected to the internet.',
                { position: "bottom-center", heading: 'Offline', hideAfter: 10, onClick: (hide: any) => hide() }
            );
        }
    }, [isOnline]);

    const routes = {
        '/': () => <Home />,
        '/spotify-authorization': () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
        '/spotify-authorization/': () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
        '/sort': () => <Sort token={token} user={spotifyData.user} playlists={spotifyData.playlists} tracks={spotifyData.tracks} playlistsLoading={playlistsLoading} refreshPlaylist={refreshPlaylist} refreshUsersPlaylists={refreshUsersPlaylists} />,
        '/about': () => <About />,
    };
    const routeResult = useRoutes(routes);
    useRedirect('/sort/', '/sort');
    useRedirect('/about/', '/about');

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
