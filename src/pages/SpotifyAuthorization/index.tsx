import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";
import { encodeData, randomString } from '../../logic/Utils';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import settings from '../../settings.json';
import { Token } from '../../Models';
import { SpotifyUser } from '../../Models';
import { getUser } from '../../logic/Spotify';


/**
 * Based off https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow
 */

const local_storage_state_key = 'spotify-auth-random-state';

enum SubState {
    Waiting, // Waiting for a decision
    AlreadyValid, // Token provided is already valid (from the info we are given - we don't verify)
    RequestForToken, // We have identified that we need to request a token
    TokenNotRequestedByThisApplication, // Token data provided was not asked for (does not match nonce/'state')
    IncorrectURLParameters, // Parameters after # do not supply the correct information
    RecievedToken, // Token has been recieved and we are now requesting user information
    Complete // We now have user information, redirect to provided url
}

interface IProps extends RouteComponentProps<{}> {
    token: Token | null,
    onUserChange: (token: Token, user: SpotifyUser) => void,
    redirectToOnCompletion: string
}

interface IState {
    subState: SubState
}

class SpotifyAuthorization extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            subState: SubState.Waiting
        }
    }

    componentDidMount() {
        const { location } = this.props;

        if (this.currentTokenValid()) {
            this.setState({ subState: SubState.AlreadyValid });
            return;
        } else {
            // If there is no token, check if we have info in the url
            if (location.hash === '') { // No token in URL, redirect user to request for one
                this.setState({ subState: SubState.RequestForToken });
                this.directToSpotify();

            } else { // We have recieved the token, read it from the URL
                const params = new URLSearchParams(location.hash.substr(1));
                const access_token = params.get('access_token');
                const expires_in = params.get('expires_in');
                const state = params.get('state');

                if (access_token !== null && expires_in !== null && state !== null) { // All parameters are present
                    const stored_random_state = localStorage.getItem(local_storage_state_key);
                    
                    if (stored_random_state !== null && stored_random_state === state) { // Random state was set and matches
                        this.setState({ subState: SubState.RecievedToken });
                        localStorage.removeItem(local_storage_state_key);
                        // Get the user with the new token
                        this.getUser(access_token, parseInt(expires_in));

                    } else { // Token recieved but it does not match the state stored (if there was one)
                        this.setState({ subState: SubState.TokenNotRequestedByThisApplication });
                    }
                } else {
                    this.setState({ subState: SubState.IncorrectURLParameters });
                }
            }
        }
    }

    currentTokenValid(): boolean {
        // Check if the token provided by the parent component is valid
        return this.props.token !== null && this.props.token.expiry > new Date();
    }

    directToSpotify(): void {
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
    }

    getUser(token: string, expires_in: number): void {
        getUser(token)
            .then(user => {
                let expiryDate = new Date();
                expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
                this.props.onUserChange({ value: token, expiry: expiryDate }, user);
                this.setState({ subState: SubState.Complete });
            });
    }

    render() {
        const { redirectToOnCompletion } = this.props;
        const { subState } = this.state;

        let message = <></>;

        switch (subState) {
            case SubState.Waiting:
                message = <p className="lead"></p>;
                break;
            case SubState.AlreadyValid:
                message = <Redirect to={redirectToOnCompletion} />;
                break;
            case SubState.RequestForToken:
                message = <>
                    <Spinner animation="border" />
                    <p className="lead">Requesting token, you will be redirected to Spotify</p>
                </>;
                break;
            case SubState.TokenNotRequestedByThisApplication:
                message = <p className="lead">Token not requested by this application</p>;
                break;
            case SubState.IncorrectURLParameters:
                message = <p className="lead">Incorrect URL parameters</p>;
                break;
            case SubState.RecievedToken:
                message = <>
                    <Spinner animation="border" />
                    <p className="lead">Recieved token, getting user data</p>
                </>;
                break;
            default: // SubState.Complete
                message = <Redirect to={redirectToOnCompletion} />;
                break;
        }

        return <Container className="text-center">
            <h1>Spotify Authorization</h1>
            {message}
        </Container>;
    }
}

export default withRouter(SpotifyAuthorization);
