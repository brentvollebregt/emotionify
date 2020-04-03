import React, { useState } from "react";
import { Badge, Dropdown, DropdownButton, FormControl, InputGroup, Table } from "react-bootstrap";
import { PlaylistObjectSimplifiedWithTrackIds } from "../models/Spotify";
import useWindowSize from "../hooks/WindowSize";

interface IProps {
  playlists: PlaylistObjectSimplifiedWithTrackIds[];
  selectedPlaylistIds: string[];
  selectionsAllowed: "Single" | "Multiple" | "All";
  defaultSelectionType?: "Single" | "Multiple";
  onPlaylistSelectionChange: (playlist_ids: string[], scrollOnFirstSelection: boolean) => void;
}

const selectedBackground =
  "linear-gradient(to right, rgba(0, 82, 157, 0.3), rgba(235, 18, 27, 0.3))";

const PlaylistSelection: React.FunctionComponent<IProps> = (props: IProps) => {
  const {
    playlists,
    selectedPlaylistIds,
    selectionsAllowed,
    defaultSelectionType,
    onPlaylistSelectionChange
  } = props;

  const [singlePlaylistSelection, setSinglePlaylistSelection] = useState(
    selectionsAllowed === "All" // If we are allowed all (two) selections
      ? defaultSelectionType !== undefined
        ? defaultSelectionType === "Single"
        : true // If a default is defined, use it, otherwise default to single
      : selectionsAllowed === "Single" // If a specific kind of selection is allowed, use that as the default (this will be fixed)
  );
  const [search, setSearch] = useState("");
  const windowSize = useWindowSize();

  const onSearchChange = (event: React.FormEvent<any>) => setSearch(event.currentTarget.value);
  const singlePlaylistSelectionChange = (value: boolean) => () => {
    if (value && selectedPlaylistIds.length > 1) {
      onPlaylistSelectionChange(
        selectedPlaylistIds.length > 0 ? [selectedPlaylistIds[0]] : [],
        false
      );
    }
    setSinglePlaylistSelection(value);
  };
  const onComponentPlaylistSelected = (playlist_id: string) => () => {
    if (singlePlaylistSelection || selectionsAllowed === "Single") {
      onPlaylistSelectionChange([playlist_id], true);
    } else {
      if (selectedPlaylistIds.indexOf(playlist_id) === -1) {
        onPlaylistSelectionChange([...selectedPlaylistIds, playlist_id], false);
      } else {
        onPlaylistSelectionChange(
          [...selectedPlaylistIds.filter((pid) => pid !== playlist_id)],
          false
        );
      }
    }
  };

  const filteredPlaylists = playlists.filter(
    (p) => p.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 || p.uri.indexOf(search) !== -1
  );
  const sortedPlaylists = filteredPlaylists.sort(
    (a: PlaylistObjectSimplifiedWithTrackIds, b: PlaylistObjectSimplifiedWithTrackIds) =>
      a.name === b.name ? 0 : a.name > b.name ? 1 : -1
  );

  const bootstrapBreakpointBiggerThanSm = () => windowSize.innerWidth > 576; // Bootstrap >sm in js

  return (
    <>
      <div className="mw-100 m-auto" style={{ width: 700 }}>
        <InputGroup className="mb-1">
          <InputGroup.Prepend>
            <InputGroup.Text>
              {bootstrapBreakpointBiggerThanSm() ? "Search Playlists" : "Search"}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl placeholder="Playlist name..." value={search} onChange={onSearchChange} />
          <DropdownButton
            as={InputGroup.Append}
            variant="outline-secondary"
            title={singlePlaylistSelection ? "Single" : "Multiple"}
            id="playlist-selection-types"
            alignRight
            disabled={selectionsAllowed !== "All"}
          >
            {(selectionsAllowed === "Single" || selectionsAllowed === "All") && (
              <Dropdown.Item onClick={singlePlaylistSelectionChange(true)}>
                Single Playlist Selection
              </Dropdown.Item>
            )}
            {(selectionsAllowed === "Multiple" || selectionsAllowed === "All") && (
              <Dropdown.Item onClick={singlePlaylistSelectionChange(false)}>
                Multiple Playlist Selection
              </Dropdown.Item>
            )}
          </DropdownButton>
        </InputGroup>

        <div style={{ maxHeight: 450, overflowX: "auto" }}>
          <Table striped hover>
            <tbody>
              {sortedPlaylists.map((playlist) => (
                <tr
                  key={playlist.id}
                  onClick={onComponentPlaylistSelected(playlist.id)}
                  style={{
                    cursor: "pointer",
                    background:
                      selectedPlaylistIds.indexOf(playlist.id) !== -1
                        ? selectedBackground
                        : undefined,
                    display: "grid",
                    gridTemplateColumns: "60px 1fr"
                  }}
                >
                  <td style={{ padding: 2 }}>
                    {playlist.images.length > 0 && (
                      <img
                        src={playlist.images[0].url}
                        className="w-100"
                        alt={"Artwork for: " + playlist.name}
                      />
                    )}
                  </td>
                  <td className="text-left" style={{ padding: "0 0 0 10px" }}>
                    <div style={{ fontSize: 22 }}>{playlist.name}</div>
                    <div>
                      <Badge variant="primary">{playlist.owner.display_name}</Badge>
                      <Badge variant="dark" className="ml-1">
                        Songs: {playlist.tracks.total}
                      </Badge>
                      <Badge variant="danger" className="ml-1">
                        {playlist.public ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default PlaylistSelection;
