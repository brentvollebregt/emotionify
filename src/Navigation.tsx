import React from 'react';
import logo from './logo.png';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'

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
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/sort">Sort</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
