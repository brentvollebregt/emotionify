import React from "react";
import { navigate, usePath } from "hookrouter";
import { Button } from "react-bootstrap";
import { localStorageRedirectKey } from "../pages/SpotifyAuthorization";
import SpotifyLogoRound from "../img/spotify-logo-round.png";

interface IProps {
  user: SpotifyApi.CurrentUsersProfileResponse | undefined;
  onLoggedInClick?: () => void;
}

const SpotifyLoginStatusButton: React.FunctionComponent<IProps> = (props: IProps) => {
  const { user, onLoggedInClick } = props;

  const path = usePath();

  const loggedInStatusButtonClick = () => {
    if (user === undefined) {
      localStorage.setItem(localStorageRedirectKey, path);
      navigate("/spotify-authorization");
    } else {
      if (onLoggedInClick) {
        onLoggedInClick();
      }
    }
  };

  return (
    <Button variant="outline-secondary" onClick={loggedInStatusButtonClick}>
      <img
        src={
          user !== undefined && user.images !== undefined && user.images.length > 0
            ? user.images[0].url
            : SpotifyLogoRound
        }
        alt={
          user !== undefined && user.images !== undefined && user.images.length > 0
            ? user.display_name + " Logo"
            : "Spotify Logo Round"
        }
        style={{ height: 20, width: 20 }}
        className="mr-2 rounded-circle"
      />
      {user !== undefined ? user.display_name : "Sign In With Spotify"}
    </Button>
  );
};

export default SpotifyLoginStatusButton;
