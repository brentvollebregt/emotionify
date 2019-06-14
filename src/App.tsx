import React, { useState, useEffect } from 'react';
import { useRoutes, useTitle } from 'hookrouter';
import Navigation from './components/Navigation';
import SpotifyAuthorization from './pages/SpotifyAuthorization';
import Home from './pages/Home';
import About from './pages/About';
import Sort from './pages/Sort';
import NotFound from './pages/NotFound';
import { Token } from './Models';

// const local_storage_key = 'emotionify-app';

interface IProps { }

interface SpotifyData {
    user: SpotifyApi.CurrentUsersProfileResponse | undefined,
    playlists: {
        [key: string]: SpotifyApi.PlaylistObjectSimplified
    },
    tracks: {
        [key: string]: SpotifyApi.PlaylistTrackObject
    },
    audioFeatures: {
        [key: string]: SpotifyApi.AudioFeaturesObject
    },
}

const emptySpotifyData = {
    user: undefined,
    playlists: {},
    tracks: {},
    audioFeatures: {}
}

export const App: React.FunctionComponent = (props: IProps) => {
    useTitle('Emotionify');

    const [token, setToken] = useState<Token | undefined>(undefined);
    const [spotifyData, setSpotifyData] = useState<SpotifyData>(emptySpotifyData);

    // TODO: Possible data preservation in localStorage

    const onTokenChange = (newToken: Token | undefined) => {
        console.log('[Token Change]', newToken);
        setToken(newToken);
        if (token === undefined) {
            setSpotifyData(emptySpotifyData);
        } else {
            // TODO Request user again
            // TODO If the users are different, delete all stored data
        }
    };

    const onLogOut = () => onTokenChange(undefined);

    const refreshUsersPlaylists = () => {

    }

    const refreshPlaylist = (playlist: SpotifyApi.PlaylistTrackObject) => {

    }

    const routes = {
        '/': () => <Home />,
        '/spotify-authorization': () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
        // '/sort': () => <Sort />, // Needs token, playlists, tracks, refreshUserPlaylists, refreshPlaylist
        '/about': () => <About />,
    };
    const routeResult = useRoutes(routes);

    return <>
        <Navigation user={spotifyData.user} onLogOut={onLogOut} />
        {routeResult || <NotFound />}
    </>
}

export default App;
