import React, { useState } from "react";
import { Accordion, Card, Table } from "react-bootstrap";
import { SpotifyTrackWithIndexes } from "../../logic/PointSorting";
import { randomString } from "../../logic/Utils";

interface IProps {
  tracks: SpotifyTrackWithIndexes[]; // These are sorted using the current method when they come in
  x_audio_feature: keyof SpotifyApi.AudioFeaturesObject;
  x_audio_feature_name: string;
  y_audio_feature: keyof SpotifyApi.AudioFeaturesObject;
  y_audio_feature_name: string;
}

const header_cell_style: React.CSSProperties = {
  position: "sticky",
  top: 0,
  background: "white",
  borderTop: 0
};

const expandedDefault = false;

const TrackTable: React.FunctionComponent<IProps> = (props: IProps) => {
  const {
    tracks,
    x_audio_feature,
    x_audio_feature_name,
    y_audio_feature,
    y_audio_feature_name
  } = props;

  const [randomEventKey] = useState(randomString(16));
  const [expanded, setExpanded] = useState(expandedDefault);
  const toggleExpansion = () => setExpanded(!expanded);

  return (
    <Accordion
      defaultActiveKey={expandedDefault ? randomEventKey : undefined}
      className="m-auto"
      style={{ maxWidth: 900 }}
    >
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          eventKey={randomEventKey}
          onClick={toggleExpansion}
          style={{ cursor: "pointer" }}
        >
          {expanded
            ? "Songs in Playlist (click to collapse)"
            : "Songs in Playlist (click to expand)"}
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={randomEventKey}>
          <Card.Body
            className="p-0"
            style={{ maxHeight: 400, overflowY: "auto", borderTop: "1px solid #dee2e6" }}
          >
            <Table bordered striped size="sm" className="border-top-0">
              <thead>
                <tr>
                  <th style={header_cell_style}>Moved</th>
                  <th style={header_cell_style}>Title</th>
                  <th style={header_cell_style} className="d-none d-md-table-cell">
                    Artist(s)
                  </th>
                  <th style={header_cell_style}>{x_audio_feature_name}</th>
                  <th style={header_cell_style}>{y_audio_feature_name}</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id}>
                    <td
                      style={
                        track.index.after - track.index.before === 0
                          ? { color: "black" }
                          : track.index.after - track.index.before < 0
                          ? { color: "green" }
                          : { color: "red" }
                      }
                    >
                      {track.index.before - track.index.after}
                    </td>
                    <td>{track.name}</td>
                    <td className="d-none d-md-table-cell">
                      {track.artists.map((a) => a.name).join(", ")}
                    </td>
                    <td>
                      {track.audio_features !== undefined &&
                        track.audio_features !== null &&
                        track.audio_features[x_audio_feature]}
                    </td>
                    <td>
                      {track.audio_features !== undefined &&
                        track.audio_features !== null &&
                        track.audio_features[y_audio_feature]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default TrackTable;
