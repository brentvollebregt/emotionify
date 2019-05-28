import React from 'react';
import logo from './logo.png';
import './App.css';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'

const App: React.FC = () => {
  return (
    <Navbar collapseOnSelect expand="sm" bg="light" variant="light" fixed="top">
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
            <Nav.Link href="/sort/">Sort</Nav.Link>
            <Nav.Link href="/about/">About</Nav.Link>
          </Nav>
          {/* <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-primary">Search</Button>
          </Form> */}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default App;
