import React, { useState, useEffect } from 'react';
import { useRoutes } from 'hookrouter';
import { useAsync } from "react-async";
import SpotifyWebApi from 'spotify-web-api-js';
import Navigation from './components/Navigation';
import SpotifyAuthorization from './pages/SpotifyAuthorization';
import Home from './pages/Home';
import About from './pages/About';
import Sort from './pages/Sort';
import NotFound from './pages/NotFound';
import { Token, SpotifyData } from './models/Spotify';
import { getAllSpotifyUsersPlaylists } from './logic/Spotify';
import { arrayToObject } from './logic/Utils';

// const local_storage_key = 'emotionify-app';

const emptySpotifyData = {
    user: undefined,
    playlists: {},
    tracks: {},
    audioFeatures: {}
}

interface IProps { }

export const App: React.FunctionComponent = (props: IProps) => {
    const [token, setToken] = useState<Token | undefined>(undefined);
    const [spotifyData, setSpotifyData] = useState<SpotifyData>(emptySpotifyData);

    // TODO: Possible data preservation in localStorage

    const onTokenChange = (newToken: Token | undefined) => {
        setToken(newToken);
    };

    const onLogOut = () => onTokenChange(undefined);

    const refreshUsersPlaylists = () => {
        if (token !== undefined && spotifyData.user !== undefined) {
            getAllSpotifyUsersPlaylists(token, spotifyData.user)
                .then(playlists => {
                    setSpotifyData({ 
                        ...spotifyData,
                        playlists: arrayToObject<SpotifyApi.PlaylistObjectSimplified>(playlists, "id")
                    });
                })
                .catch(err => console.error(err));
        }
    }

    const refreshPlaylist = (playlist: SpotifyApi.PlaylistTrackObject) => {

    }

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
