import React from 'react';
import { navigate } from 'hookrouter';
import banner from '../img/banner.png';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import NavItem from 'react-bootstrap/NavItem';
import SpotifyLoginStatusButton from './SpotifyLoginStatusButton'

interface IProps {
  user: SpotifyApi.CurrentUsersProfileResponse | undefined
  onLogOut: () => void
}

const Navigation: React.FunctionComponent<IProps> = (props: IProps) => {
  const { user, onLogOut } = props;

  const goToHome = () => navigate('/');
  const goToSort = () => navigate('/sort');
  const goToAbout = () => navigate('/about');

  const logout = () => onLogOut(); // TODO Dialog: "Are you sure you want to logout?"

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
            <SpotifyLoginStatusButton user={user} onLoggedInClick={logout} />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
