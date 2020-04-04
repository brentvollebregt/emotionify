import React from "react";
import { navigate } from "hookrouter";
import { Container, Spinner } from "react-bootstrap";
import { encodeData, randomString } from "../../logic/Utils";
import { Token } from "../../models/Spotify";
import config from "../../config";

// Based off https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow

const localStorageStateKey = "spotify-auth-random-state";
export const localStorageRedirectKey = "auth-local-redirect";

interface IProps {
  onTokenChange: (newToken: Token | undefined) => void;
}

const SpotifyAuthorization: React.FunctionComponent<IProps> = (props: IProps) => {
  const { onTokenChange } = props;
  const { hash } = window.location;

  const redirectOut = () => {
    let local_redirect: string | null = localStorage.getItem(localStorageRedirectKey);
    if (local_redirect === null) {
      navigate("/");
    } else {
      localStorage.removeItem(localStorageRedirectKey);
      navigate(local_redirect);
    }
  };

  const onTokenRecieved = (value: string, expires_in: number) => {
    let expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
    onTokenChange({ value: value, expiry: expiryDate });
  };

  let message = <></>;

  if (hash === "") {
    // No token in URL, redirect user to request for one
    // Setup random state
    const random_state = randomString(16);
    localStorage.setItem(localStorageStateKey, random_state);
    // Redirect
    const url_parameters = {
      client_id: config.spotify.clientId,
      response_type: "token",
      redirect_uri: window.location.href,
      state: random_state,
      scope: config.spotify.permissionScope,
      show_dialog: true
    };
    const url_parameters_encoded = encodeData(url_parameters);
    window.location.href = "https://accounts.spotify.com/authorize?" + url_parameters_encoded;
    message = (
      <>
        <Spinner animation="border" />
        <p className="lead">Requesting token, you will be redirected to Spotify</p>
      </>
    );
  } else {
    // We have recieved the token, read it from the URL
    const params = new URLSearchParams(hash.substr(1));
    const access_token = params.get("access_token");
    const expires_in = params.get("expires_in");
    const state = params.get("state");

    if (access_token !== null && expires_in !== null && state !== null) {
      // All parameters are present
      const stored_random_state = localStorage.getItem(localStorageStateKey);

      if (stored_random_state !== null && stored_random_state === state) {
        // Random state was set and matches
        localStorage.removeItem(localStorageStateKey);
        onTokenRecieved(access_token, parseInt(expires_in));
        redirectOut();
        message = (
          <>
            <Spinner animation="border" />
            <p className="lead">Recieved token</p>
          </>
        );
      } else {
        // Token recieved but it does not match the state stored (if there was one)
        message = <p className="lead">Token not requested by this application</p>;
      }
    } else {
      message = <p className="lead">Incorrect URL parameters</p>;
    }
  }

  return (
    <Container className="text-center">
      <h1>Spotify Authorization</h1>
      {message}
    </Container>
  );
};

export default SpotifyAuthorization;
