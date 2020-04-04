import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import { Button, Modal } from "react-bootstrap";
import { Token } from "../models/Spotify";

interface IProps {
  token: Token | undefined;
  onLogOut: () => void;
}

const warningMilliseconds = 5 * 60 * 1000;

const TokenRefreshWarning: React.FunctionComponent<IProps> = (props: IProps) => {
  const { token } = props;
  const { onLogOut } = props;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    if (token !== undefined) {
      const milliseconds_left = token.expiry.getTime() - new Date().getTime();
      if (warningMilliseconds < milliseconds_left) {
        // If there is more than the warning time left
        timers.push(
          setTimeout(() => {
            // Setup warning
            setOpen(true);
          }, milliseconds_left - warningMilliseconds)
        );
        timers.push(
          setTimeout(() => {
            // Setup token expired
            setOpen(true);
          }, milliseconds_left)
        );
      } else if (milliseconds_left > 0) {
        // If there is time left
        timers.push(
          setTimeout(() => {
            // Setup token expired
            setOpen(true);
          }, milliseconds_left)
        );
        setOpen(true); // Show
      } else {
        // If there is no time left
        setOpen(true); // Show
      }
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [token]);

  const refreshClick = () => {
    onLogOut();
    navigate("/spotify-authorization");
  };
  const cancelClick = () => setOpen(false);

  if (token !== undefined && open) {
    const expired: boolean = token.expiry.getTime() - new Date().getTime() <= 0;

    return (
      <Modal show={open} onHide={cancelClick}>
        <Modal.Header closeButton>
          <Modal.Title>
            {expired ? "Spotify Token Expired" : "Spotify Token Refresh Warning"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {expired ? (
            <>
              Your Spotify token has now expired and we can no longer access your data; sign back in
              with Spotify to get an new token.
              <br />
              We will leave you logged in here so you can still view your data but we will not be
              able to get data from Spotify for you.
            </>
          ) : (
            <>
              Since Spotify issues client side tokens for upto an hour, you will need a new token
              soon. Your current token expires at {token.expiry.toLocaleTimeString()}.
              <br />
              To do this, we'll send you back to the Spotify authorization page again to get a new
              token.
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelClick}>
            Close
          </Button>
          <Button variant="primary" onClick={refreshClick}>
            Refresh Token
          </Button>
        </Modal.Footer>
      </Modal>
    );
  } else {
    return <></>;
  }
};

export default TokenRefreshWarning;
