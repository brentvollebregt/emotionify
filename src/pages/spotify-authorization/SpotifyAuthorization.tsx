import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";
import { encodeData, randomString } from '../../Utils';
import Container from 'react-bootstrap/Container';

/**
 * Based off https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow
 */

const client_id = '3d402278ec5e45bc930e791de2741b3e'; // TODO Move out to a settings object
const local_storage_state_key = 'spotify-auth-random-state';

interface SpotifyAuthorizationProps extends RouteComponentProps<{}> {
    currentToken: string | null,
    onTokenChanged: ((token: string, expiry: number) => void)
}

const SpotifyAuthorization: React.SFC<SpotifyAuthorizationProps> = (props: SpotifyAuthorizationProps) => {
    if (props.currentToken !== null) { // If we do have a token, go to /sort
        return <Redirect to='/sort' />
    } else {
        let message = '';

        // If there is no token, check if we have info in the url
        if (props.location.hash === '') { // No token in URL, redirect user to request for one
            // Setup random state
            const random_state = randomString(16);
            localStorage.setItem(local_storage_state_key, random_state)
            // Redirect
            const url_parameters = {
                'client_id': client_id,
                'response_type': 'token',
                'redirect_uri': window.location.href,
                'state': random_state,
                'scope': 'user-library-read playlist-read-private user-read-private playlist-modify-private playlist-modify-public',
                'show_dialog': true,
            }
            const url_parameters_encoded = encodeData(url_parameters);
            window.location.href = 'https://accounts.spotify.com/authorize?' + url_parameters_encoded;
            message = 'Requesting token, you will be redirected to Spotify';

        } else { // We have recieved the token, read it from the URL
            const params = new URLSearchParams(props.location.hash.substr(1));
            const access_token = params.get('access_token');
            const expires_in = params.get('expires_in');
            const state = params.get('state');

            if (access_token !== null && expires_in !== null && state !== null) { // All parameters are present
                const stored_random_state = localStorage.getItem(local_storage_state_key);
                if (stored_random_state !== null && stored_random_state === state) { // Random state was set and matches
                    props.onTokenChanged(access_token, parseInt(expires_in));
                    localStorage.removeItem(local_storage_state_key)
                    return <Redirect to='/sort' />;

                } else { // Token recieved but it does not match the state stored (if there was one)
                    message = 'Token not requested by application';
                }
            } else {
                message = 'Incorrect URL parameters';
            }
        }
        return <Container className="text-center">
            <h1>Spotify Authorization</h1>
            <p className="lead">{message}</p>
        </Container>;
    }
}

SpotifyAuthorization.defaultProps = {
    currentToken: null,
    onTokenChanged: () => { },
}

export default withRouter(SpotifyAuthorization);