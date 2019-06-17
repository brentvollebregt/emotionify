import React from 'react';
import { navigate } from 'hookrouter';
import Button from 'react-bootstrap/Button';
import SpotifyLogoRound from '../img/spotify-logo-round.png';

interface IProps {
    user: SpotifyApi.CurrentUsersProfileResponse | undefined
    onLoggedInClick: () => void
}

const SpotifyLoginStatusButton: React.FunctionComponent<IProps> = (props: IProps) => {
    const { user, onLoggedInClick } = props;

    const loggedInStatusButtonClick = () => {
        if (user === undefined) {
            navigate('/spotify-authorization');
        } else {
            onLoggedInClick();
        }
    }

    return <Button variant="outline-secondary" onClick={loggedInStatusButtonClick}>
        <img
            src={
                user !== undefined && user.images !== undefined && user.images.length > 0
                    ? user.images[0].url
                    : SpotifyLogoRound
            }
            alt={
                user !== undefined && user.images !== undefined && user.images.length > 0
                    ? user.display_name + ' Logo'
                    : 'Spotify Logo Round'
            }
            style={{ height: 20, width: 20, borderRadius: '50%' }}
            className="mr-2"
        />
        {
            user !== undefined && user.images !== undefined && user.images.length > 0
                ? user.display_name
                : 'Sign In With Spotify'
        }
    </Button>;
}

export default SpotifyLoginStatusButton;