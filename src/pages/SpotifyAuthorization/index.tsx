import React from 'react';
import { navigate } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import settings from '../../settings.json';
import { encodeData, randomString, getHashParameters } from '../../logic/Utils';
import { Token } from '../../models/Spotify';

// Based off https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow

const localStorageStateKey = 'spotify-auth-random-state';
export const localStorageRedirectKey = 'auth-local-redirect';

interface IProps {
    onTokenChange: (newToken: Token | undefined) => void,
}

const SpotifyAuthorization: React.FunctionComponent<IProps> = (props: IProps) => {
    const { onTokenChange } = props;
    const { hash } = window.location;

    const redirectOut = () => {
        let local_redirect: string | null = localStorage.getItem(localStorageRedirectKey);
        if (local_redirect === null) {
            navigate('/');
        } else {
            localStorage.removeItem(localStorageRedirectKey);
            navigate(local_redirect);
        }
    }
    
    const onTokenRecieved = (value: string, expires_in: number) => {
        let expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
        onTokenChange({ value: value, expiry: expiryDate });
    };

    let message = <></>;

    if (hash === '') { // No token in URL, redirect user to request for one
        // Setup random state
        const random_state = randomString(16);
        localStorage.setItem(localStorageStateKey, random_state);
        // Redirect
        const url_parameters = {
            'client_id': settings.spotify_client_id,
            'response_type': 'token',
            'redirect_uri': window.location.href,
            'state': random_state,
            'scope': settings.spotify_premission_scope,
            'show_dialog': true,
        }
        const url_parameters_encoded = encodeData(url_parameters);
        window.location.href = 'https://accounts.spotify.com/authorize?' + url_parameters_encoded;
        message = <>
            <Spinner animation="border" />
            <p className="lead">Requesting token, you will be redirected to Spotify</p>
        </>;

    } else { // We have recieved the token, read it from the URL
        const hashParams = getHashParameters();
        const access_token = hashParams['access_token'];
        const expires_in = hashParams['expires_in'];
        const state = hashParams['state'];

        if (access_token !== null && expires_in !== null && state !== null) { // All parameters are present
            const stored_random_state = localStorage.getItem(localStorageStateKey);
            
            if (stored_random_state !== null && stored_random_state === state) { // Random state was set and matches
                localStorage.removeItem(localStorageStateKey);
                onTokenRecieved(access_token, parseInt(expires_in));
                redirectOut();
                message = <>
                    <Spinner animation="border" />
                    <p className="lead">Recieved token</p>
                </>;

            } else { // Token recieved but it does not match the state stored (if there was one)
                message = <p className="lead">Token not requested by this application</p>;
            }
            
        } else {
            message = <p className="lead">Incorrect URL parameters</p>;
        }
    }

    return <Container className="text-center">
        <h1>Spotify Authorization</h1>
        {message}
    </Container>;
}

export default SpotifyAuthorization;
