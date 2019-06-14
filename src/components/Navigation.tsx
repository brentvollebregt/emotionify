import React from 'react';
import banner from '../img/banner.png';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import NavItem from 'react-bootstrap/NavItem';
import Button from 'react-bootstrap/Button';
import { navigate } from 'hookrouter';
import SpotifyLogoRound from '../img/spotify-logo-round.png';

interface IProps {
  user: SpotifyApi.CurrentUsersProfileResponse | undefined
  onLogOut: () => void
}

const Navigation: React.FunctionComponent<IProps> = (props: IProps) => {
  const { user, onLogOut } = props;

  const goToHome = () => navigate('/');
  const goToSort = () => navigate('/sort');
  const goToAbout = () => navigate('/about');

  const loggedInStatusButtonClick = () => {
    if (user === undefined) {
      navigate('/spotify-authorization');
    } else {
      // TODO Dialog: "Are you sure you want to logout?"
      onLogOut();
    }
  }

  return (
    <Navbar collapseOnSelect expand="sm" bg="light" variant="light" sticky="top">
      <Container>
        <Navbar.Brand onClick={goToHome}>
          <img
            src={banner}
            height="30"
            className="d-inline-block align-top"
            alt="Emotionify Banner Logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link>
              <NavItem onClick={goToHome}>Home</NavItem>
            </Nav.Link>
            <Nav.Link>
              <NavItem onClick={goToSort}>Sort</NavItem>
            </Nav.Link>
            <Nav.Link>
              <NavItem onClick={goToAbout}>About</NavItem>
            </Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-secondary" onClick={loggedInStatusButtonClick}>
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
                style={{ height: 20, width: 20 }} 
                className="mr-2" 
              />
              {
                user !== undefined && user.images !== undefined && user.images.length > 0
                ? user.display_name
                : 'Sign In With Spotify'
              }
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
