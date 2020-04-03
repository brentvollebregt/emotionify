import React from "react";
import { Badge, Spinner } from "react-bootstrap";
import { PlaylistObjectSimplifiedWithTrackIds } from "../models/Spotify";

interface IProps {
  playlists: PlaylistObjectSimplifiedWithTrackIds[];
  tracksLoading: boolean;
}

const PlaylistDetails: React.FunctionComponent<IProps> = (props: IProps) => {
  const { playlists, tracksLoading } = props;

  if (playlists.length === 1) {
    const playlist = playlists[0];
    return (
      <div>
        <h3 className="mb-0">{playlist.name}</h3>
        <div>
          <a href={playlist.owner.external_urls.spotify}>
            <Badge variant="primary">{playlist.owner.display_name}</Badge>
          </a>
          <Badge variant="dark" className="ml-1">
            Songs: {playlist.tracks.total}
          </Badge>
          <a href={playlist.external_urls.spotify} className="ml-1">
            <Badge variant="success">Spotify</Badge>
          </a>
          <Badge variant="danger" className="ml-1">
            {playlist.public ? "Public" : "Private"}
          </Badge>
        </div>
        {tracksLoading && (
          <div className="text-center mt-3">
            <Spinner animation="border" />
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <h3 className="mb-0">
          {playlists.length} Playlist{playlists.length > 1 && "s"} Selected
        </h3>
        <div>
          <Badge variant="dark" className="ml-1">
            Songs: {playlists.map((p) => p.tracks.total).reduce((a, b) => a + b)}
          </Badge>
        </div>
        {tracksLoading && (
          <div className="text-center mt-3">
            <Spinner animation="border" />
          </div>
        )}
      </div>
    );
  }
};

export default PlaylistDetails;
