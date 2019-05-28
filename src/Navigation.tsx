import React from 'react';
import logo from './logo.png';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import NavItem from 'react-bootstrap/NavItem'
import { LinkContainer } from "react-router-bootstrap";

const Navigation: React.FC = () => {
  return (
    <Navbar collapseOnSelect expand="sm" bg="light" variant="light" sticky="top">
      <Container>
        <Navbar.Brand href="/">
          <img 
            src={logo} 
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Emotionify Logo"
          />
          {' Emotionify'}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link>
              <LinkContainer to="/">
                <NavItem>Home</NavItem>
              </LinkContainer>
            </Nav.Link>
            <Nav.Link>
              <LinkContainer to="/sort">
                <NavItem>Sort</NavItem>
              </LinkContainer>
            </Nav.Link>
            <Nav.Link>
              <LinkContainer to="/about">
                <NavItem>About</NavItem>
              </LinkContainer>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
