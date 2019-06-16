import React from 'react';
import { encodeData, randomString } from '../../logic/Utils';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import settings from '../../settings.json';
import { Token } from '../../models/Spotify';
import { navigate } from 'hookrouter';

// Based off https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow

const local_storage_state_key = 'spotify-auth-random-state';

interface IProps {
    onTokenChange: (newToken: Token | undefined) => void,
}

const SpotifyAuthorization: React.FunctionComponent<IProps> = (props: IProps) => {
    const { onTokenChange } = props;
    const { hash } = window.location;

    const goToHome = () => navigate('/'); // TODO Eventually put this on whatever page we came from (can get the most recent url before we send the user out from the history)
    const onTokenRecieved = (value: string, expires_in: number) => {
        let expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
        onTokenChange({ value: value, expiry: expiryDate });
    };

    let message = <></>;

    if (hash === '') { // No token in URL, redirect user to request for one
        // Setup random state
        const random_state = randomString(16);
        localStorage.setItem(local_storage_state_key, random_state);
        // Redirect
        const url_parameters = {
            'client_id': settings.spotify_client_id,
            'response_type': 'token',
            'redirect_uri': window.location.href,
            'state': random_state,
            'scope': 'user-library-read playlist-read-private user-read-private playlist-modify-private playlist-modify-public',
            'show_dialog': true,
        }
        const url_parameters_encoded = encodeData(url_parameters);
        window.location.href = 'https://accounts.spotify.com/authorize?' + url_parameters_encoded;
        message = <>
            <Spinner animation="border" />
            <p className="lead">Requesting token, you will be redirected to Spotify</p>
        </>;

    } else { // We have recieved the token, read it from the URL
        const params = new URLSearchParams(hash.substr(1));
        const access_token = params.get('access_token');
        const expires_in = params.get('expires_in');
        const state = params.get('state');

        if (access_token !== null && expires_in !== null && state !== null) { // All parameters are present
            const stored_random_state = localStorage.getItem(local_storage_state_key);
            
            if (stored_random_state !== null && stored_random_state === state) { // Random state was set and matches
                localStorage.removeItem(local_storage_state_key);
                onTokenRecieved(access_token, parseInt(expires_in));
                goToHome();
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
