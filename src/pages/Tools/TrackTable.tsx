import React, { useState } from "react";
import { Accordion, Card, Table } from "react-bootstrap";
import { randomString } from "../../logic/Utils";
import { TrackWithAudioFeatures } from "../../models/Spotify";

interface IProps {
  tracks: TrackWithAudioFeatures[];
  open: boolean;
  openToggle: () => void;
}

const header_cell_style: React.CSSProperties = {
  position: "sticky",
  top: 0,
  background: "white",
  borderTop: 0
};

const TrackTable: React.FunctionComponent<IProps> = (props: IProps) => {
  const { tracks, open, openToggle } = props;

  const [randomEventKey] = useState(randomString(16));

  return (
    <Accordion
      activeKey={open ? randomEventKey : undefined}
      className="m-auto"
      style={{ maxWidth: 900 }}
    >
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          eventKey={randomEventKey}
          onClick={openToggle}
          style={{ cursor: "pointer" }}
        >
          {`Filtered Songs: ${tracks.length} (click to ${open ? "collapse" : "expand"})`}
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={randomEventKey}>
          <Card.Body
            className="p-0"
            style={{ maxHeight: 400, overflowY: "auto", borderTop: "1px solid #dee2e6" }}
          >
            <Table bordered striped size="sm" className="border-top-0">
              <thead>
                <tr>
                  <th style={header_cell_style}>Position</th>
                  <th style={header_cell_style}>Title</th>
                  <th style={header_cell_style} className="d-none d-md-table-cell">
                    Artist(s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track: TrackWithAudioFeatures, index: number) => (
                  <tr key={track.id + index}>
                    <td>{index + 1}</td>
                    <td>{track.name}</td>
                    <td className="d-none d-md-table-cell">
                      {track.artists.map((a) => a.name).join(", ")}
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
