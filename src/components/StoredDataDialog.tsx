import React from "react";
import { Button, Modal } from "react-bootstrap";
import {
  Token,
  PlaylistObjectSimplifiedWithTrackIds,
  TrackWithAudioFeatures
} from "../models/Spotify";

interface IProps {
  token: Token;
  user: SpotifyApi.UserObjectPrivate;
  playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds };
  tracks: { [key: string]: TrackWithAudioFeatures };
  onClose: () => void;
  onLogOut: () => void;
}

const StoredDataDialog: React.FunctionComponent<IProps> = (props: IProps) => {
  const { token, user, playlists, tracks } = props;
  const { onClose, onLogOut } = props;

  const tokenStub =
    token.value.substr(0, 10) +
    "....." +
    token.value.substr(token.value.length - 10, token.value.length);
  const publicPlaylistCount = Object.values(playlists).filter((p) => p.public).length;
  const privatePlaylistCount = Object.values(playlists).filter((p) => !p.public).length;
  const tracksStored = Object.values(tracks).length;

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{user.display_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Data currently stored:
        <ul className="mb-0">
          <li title={tokenStub}>
            Token expires at: <code>{token.expiry.toLocaleTimeString()}</code>
          </li>
          <li title={user.uri}>
            User associated: <code>{user.display_name}</code>
          </li>
          <li>
            Playlists stored:{" "}
            <code>
              {publicPlaylistCount} public and {privatePlaylistCount} private
            </code>
          </li>
          <li>
            Tracks stored (with audio features): <code>{tracksStored}</code>
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onLogOut}>
          Logout
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StoredDataDialog;
