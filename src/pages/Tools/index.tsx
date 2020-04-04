import React, { useState, useEffect } from "react";
import cogoToast from "cogo-toast";
import {
  Accordion,
  Button,
  Card,
  Container,
  Dropdown,
  DropdownButton,
  InputGroup
} from "react-bootstrap";
import FilterAddPlaylists from "./FilterAddPlaylists";
import FilterReverse from "./FilterReverse";
import FilterRandomise from "./FilterRandomise";
import FilterAudioFeaturePredicate from "./FilterAudioFeaturePredicate";
import FilterOrderByAudioFeature from "./FilterOrderByAudioFeature";
import FilterDistinct from "./FilterDistinct";
import SpotifyLoginStatusButton from "../../components/SpotifyLoginStatusButton";
import TrackTable from "./TrackTable";
import ExportPlaylistInput from "../../components/ExportPlaylistInput";
import {
  Token,
  PlaylistObjectSimplifiedWithTrackIds,
  TrackWithAudioFeatures
} from "../../models/Spotify";
import { createPlaylist } from "../../logic/Spotify";

interface IProps {
  token: Token | undefined;
  user: SpotifyApi.UserObjectPrivate | undefined;
  playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds };
  tracks: { [key: string]: TrackWithAudioFeatures };
  playlistsLoading: Set<string>;
  refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void;
  refreshUsersPlaylists: (hard: boolean) => void;
}

interface AppliedFilter {
  filterName: string;
  filter: ((tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[]) | undefined;
  titleText: string;
}

const filters: { [key: string]: React.FunctionComponent<any> } = {
  "Add Playlist": FilterAddPlaylists,
  Reverse: FilterReverse,
  Randomise: FilterRandomise,
  "Filter Audio Feature": FilterAudioFeaturePredicate,
  "Order by Audio Feature": FilterOrderByAudioFeature,
  "Remove Duplicates": FilterDistinct
};

const track_identity_function = (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] =>
  tracks;

const Tools: React.FunctionComponent<IProps> = (props: IProps) => {
  const {
    token,
    user,
    playlists,
    tracks,
    playlistsLoading,
    refreshPlaylist,
    refreshUsersPlaylists
  } = props;

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([
    {
      filterName: "Add Playlist",
      filter: track_identity_function,
      titleText: ""
    }
  ]);
  const [addFilterDropdownSelection, setAddFilterDropdownSelection] = useState(
    Object.keys(filters)[0]
  );
  const [activeCardEventKey, setActiveCardEventKey] = useState("0"); // Need to keep track of these as dropdowns in the accordion will close cards
  const [filteredTracks, setFilteredTracks] = useState<TrackWithAudioFeatures[]>([]);

  // Track table open state (need to track this in here otherwise it will close on every change)
  const [trackTableOpen, setTrackTableOpen] = useState(false);
  const trackTableOpenToggle = () => setTrackTableOpen(!trackTableOpen);

  useEffect(() => {
    // Apply new filters as they appear
    const currentFilters = appliedFilters.map((af) => af.filter);
    if (currentFilters.indexOf(undefined) === -1) {
      setFilteredTracks(
        appliedFilters
          .map((af) => af.filter as (tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[])
          .reduce((accumulator: TrackWithAudioFeatures[], filter) => filter(accumulator), [])
      );
    } else {
      setFilteredTracks([]);
    }
  }, [appliedFilters]);

  const header = (
    <Container className="mt-3 mb-4">
      <h1 className="text-center">Playlist Tools</h1>
      <p className="text-center lead col-md-7 mx-auto">
        Apply filters and functions to manipulate your playlists.
      </p>
    </Container>
  );

  if (user === undefined) {
    return (
      <>
        {header}
        <Container className="text-center">
          <h2>Sign into Spotify</h2>
          <p>
            To get access to your playlists and the ability to create playlists, you need to sign
            into Spotify.
          </p>
          <SpotifyLoginStatusButton user={user} />
        </Container>
      </>
    );
  }

  const onCardHeaderClick = (eventKey: string) => () =>
    setActiveCardEventKey(activeCardEventKey !== eventKey ? eventKey : "");
  const filterDropdownSelect = (filterName: string) => () =>
    setAddFilterDropdownSelection(filterName);
  const addFilter = () => {
    setActiveCardEventKey(appliedFilters.length + "");
    setAppliedFilters((currentlyAppliedFilters) => [
      ...currentlyAppliedFilters,
      { filterName: addFilterDropdownSelection, filter: undefined, titleText: "" }
    ]);
  };
  const removeFilter = (index: number) => (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setAppliedFilters((currentlyAppliedFilters) => {
      let newListOfFeatures = [...currentlyAppliedFilters];
      newListOfFeatures.splice(index, 1);
      return newListOfFeatures;
    });
    event.stopPropagation();
  };

  const filterComponentOutputCallback = (index: number) => (
    filter: ((tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[]) | undefined,
    titleText: string
  ) => {
    setAppliedFilters((currentlyAppliedFilters) => {
      let newListOfFeatures = [...currentlyAppliedFilters];
      newListOfFeatures[index] = {
        filterName: newListOfFeatures[index].filterName,
        filter: filter,
        titleText: titleText
      };
      return newListOfFeatures;
    });
  };

  const onExport = (name: string, isPublic: boolean): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      if (filteredTracks.length === 0) {
        cogoToast.warn("No songs present after filtering. Will not create an empty playlist.", {
          position: "bottom-center",
          heading: "No Songs",
          hideAfter: 10,
          onClick: (hide: any) => hide()
        });
        reject();
        return;
      }

      if (token !== undefined && user !== undefined) {
        // Map the sorted tracks to uris
        let track_uris: string[] = filteredTracks.map((t) => tracks[t.id].uri);
        // Create the playlist
        let success: boolean = await createPlaylist(
          token.value,
          user,
          name,
          isPublic,
          track_uris
        ).then(
          (playlist) => {
            refreshUsersPlaylists(false); // Get the new playlist by refreshing the playlist list (keep current track ids to not loose plot data)
            return true;
          },
          (err) => {
            console.error(err);
            return false;
          }
        );
        resolve(success);
      }
      resolve(false);
    });
  };

  return (
    <>
      {header}

      <Container className="mb-5">
        <Accordion activeKey={activeCardEventKey}>
          {appliedFilters.map((appliedFilter: AppliedFilter, index: number) => {
            let FilterComponent = filters[appliedFilter.filterName];
            return (
              <Card key={index + appliedFilter.filterName} style={{ overflow: "visible" }}>
                <Card.Header
                  className="d-flex align-items-center p-1"
                  style={{ cursor: "pointer" }}
                  onClick={onCardHeaderClick("" + index)}
                >
                  <Button variant={appliedFilter.filter === undefined ? "danger" : "primary"}>
                    {appliedFilter.filterName}
                  </Button>
                  <span className="ml-3 flex-grow-1">{appliedFilter.titleText}</span>
                  {index !== 0 && (
                    <Button variant="danger" className="float-right" onClick={removeFilter(index)}>
                      -
                    </Button>
                  )}
                </Card.Header>
                <Accordion.Collapse eventKey={"" + index}>
                  <Card.Body>
                    <FilterComponent
                      outputCallback={filterComponentOutputCallback(index)}
                      playlists={playlists}
                      tracks={tracks}
                      playlistsLoading={playlistsLoading}
                      refreshPlaylist={refreshPlaylist}
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            );
          })}
        </Accordion>

        <div className="mt-3 text-center">
          <InputGroup className="w-auto d-inline-flex">
            <InputGroup.Prepend>
              <InputGroup.Text>Add filter</InputGroup.Text>
            </InputGroup.Prepend>
            <DropdownButton
              as={InputGroup.Prepend}
              variant="outline-primary"
              title={addFilterDropdownSelection}
              id="add-filter"
            >
              {Object.keys(filters)
                .sort()
                .map((filterName) => (
                  <Dropdown.Item key={filterName} onClick={filterDropdownSelect(filterName)}>
                    {filterName}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
            <InputGroup.Append>
              <Button onClick={addFilter}>Add</Button>
            </InputGroup.Append>
          </InputGroup>
        </div>

        <div className="my-5 text-center">
          <TrackTable
            tracks={filteredTracks}
            open={trackTableOpen}
            openToggle={trackTableOpenToggle}
          />
        </div>

        <div className="mb-5 text-center">
          <ExportPlaylistInput onExport={onExport} />
        </div>
      </Container>
    </>
  );
};

export default Tools;
