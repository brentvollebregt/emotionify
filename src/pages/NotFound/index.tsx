import React from "react";
import { navigate } from "hookrouter";
import { Button, Container } from "react-bootstrap";

const NotFound: React.FunctionComponent = () => {
  const navigateHome = () => navigate("/");

  return (
    <Container className="text-center">
      <h1 className="my-4">Page Not Found</h1>
      <Button onClick={navigateHome}>Go Home &rarr;</Button>
    </Container>
  );
};

export default NotFound;
