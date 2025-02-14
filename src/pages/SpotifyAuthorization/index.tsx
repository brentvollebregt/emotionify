import React, { useEffect, useState } from "react";
import { navigate } from "hookrouter";
import { Container, Spinner } from "react-bootstrap";
import { encodeData, randomString } from "../../logic/Utils";
import { Token } from "../../models/Spotify";
import config from "../../config";

// Follows Spotify's Authorization Code with PKCE Flow
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

const localStorageCodeVerifierKey = "spotify-auth-code-verifier";
export const localStorageRedirectKey = "auth-local-redirect";

interface IProps {
  onTokenChange: (newToken: Token | undefined) => void;
}

const SpotifyAuthorization: React.FunctionComponent<IProps> = ({ onTokenChange }) => {
  const [message, setMessage] = useState<JSX.Element>(<p className="lead">Loading...</p>);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const redirectUri = `${window.location.origin}${window.location.pathname}`; // Don't want this to include the code/error coming back (so no window.location.href)

    if (error) {
      setMessage(<p className="lead">Authorization failed: {error}</p>);
      return;
    }

    if (code === null) {
      // No code, initiate authorization request
      const codeVerifier = randomString(64);
      localStorage.setItem(localStorageCodeVerifierKey, codeVerifier);

      crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier)).then((buffer) => {
        const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(buffer)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        // Redirect
        const authUrl = `https://accounts.spotify.com/authorize?${encodeData({
          client_id: config.spotify.clientId,
          response_type: "code",
          redirect_uri: redirectUri,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
          scope: config.spotify.permissionScope
        })}`;
        window.location.href = authUrl;
      });

      setMessage(
        <>
          <Spinner animation="border" />
          <p className="lead">Redirecting to Spotify...</p>
        </>
      );
    } else {
      // Pull out the code verifier we stored previously
      const codeVerifier = localStorage.getItem(localStorageCodeVerifierKey);
      localStorage.removeItem(localStorageCodeVerifierKey);
      if (codeVerifier === null) {
        setMessage(<p className="lead">Missing code verifier</p>);
        return;
      }

      // Exchange code for access token (after authorization request comes back)
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeData({
          client_id: config.spotify.clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token && data.expires_in) {
            // Store token
            const expiryDate = new Date();
            expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);
            onTokenChange({ value: data.access_token, expiry: expiryDate });

            // Redirect back to where we came from in the application
            let local_redirect = localStorage.getItem(localStorageRedirectKey);
            if (local_redirect) {
              localStorage.removeItem(localStorageRedirectKey);
              navigate(local_redirect);
            } else {
              navigate("/");
            }

            setMessage(
              <>
                <Spinner animation="border" />
                <p className="lead">Authorization successful</p>
              </>
            );
          } else {
            setMessage(<p className="lead">Failed to retrieve access token</p>);
          }
        })
        .catch(() => setMessage(<p className="lead">Error fetching token</p>));
    }
  }, []);

  return (
    <Container className="text-center">
      <h1>Spotify Authorization</h1>
      {message}
    </Container>
  );
};

export default SpotifyAuthorization;
