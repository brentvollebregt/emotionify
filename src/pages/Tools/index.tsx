import React, { useState } from 'react';
import { useTitle } from 'hookrouter';
import FilterAddPlaylists from './FilterAddPlaylists';
import FilterReverse from './FilterReverse';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from '../../models/Spotify';

// Add Playlist (requires playlists and songs)
// Reverse
// Randomise
// Filter include|exclude {feature} ==|>|<|>=|<= value

interface IProps {
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds },
    tracks: { [key: string]: TrackWithAudioFeatures },
    playlistsLoading: Set<string>,
    refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void,
}

interface AppliedFilter {
    filterName: string,
    filter: ((tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[]) | undefined,
    titleText: string
}

const filters: {[key: string]: React.FunctionComponent<any>} = {
    'Add Playlist': FilterAddPlaylists,
    'Reverse': FilterReverse,
}

const track_identity_function = (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] => tracks;

const Tools: React.FunctionComponent<IProps> = (props: IProps) => {
    const { user, playlists, tracks, playlistsLoading, refreshPlaylist } = props;

    useTitle('Emotionify - Tools');
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([{
        filterName: 'Add Playlist',
        filter: track_identity_function,
        titleText: 'Select one or more playlists to start'
    }, {
        filterName: 'Reverse',
        filter: undefined,
        titleText: 'Reverse song order'
    }]);
    const [addFilterDropdownSelection, setAddFilterDropdownSelection] = useState(Object.keys(filters)[0]);

    const header = <Container className="mt-3 mb-4">
        <h1 className="text-center">Playlist Tools</h1>
        <p className="text-center lead col-md-7 mx-auto">Apply filters and functions to manipulate your playlists.</p>
    </Container>;

    if (user === undefined) {
        return <>
            {header}
            <Container className="text-center">
                <h2>Sign into Spotify</h2>
                <p>To get access to your playlists and the ability to create playlists, you need to sign into Spotify.</p>
                <SpotifyLoginStatusButton user={user} />
            </Container>
        </>
    }

    const filterDropdownSelect = (filterName: string) => () => setAddFilterDropdownSelection(filterName);
    const addFilter = () => setAppliedFilters(currentlyAppliedFilters => [...currentlyAppliedFilters, {filterName: addFilterDropdownSelection, filter: undefined, titleText: 'New'}]);
    const removeFilter = (index: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAppliedFilters(currentlyAppliedFilters => {
            let newListOfFeatures = [...currentlyAppliedFilters];
            newListOfFeatures.splice(index, 1);
            return newListOfFeatures;
        });
        event.stopPropagation();
    };

    const filterComponentOutputCallback = (index: number) => (filter: ((tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[]) | undefined, titleText: string) => {
        setAppliedFilters(currentlyAppliedFilters => {
            let newListOfFeatures = [...currentlyAppliedFilters];
            newListOfFeatures[index] = {
                filterName: newListOfFeatures[index].filterName,
                filter: filter,
                titleText: titleText
            }
            return newListOfFeatures;
        });
    }

    return <>
        {header}

        <Container className="mb-5">

            <Accordion defaultActiveKey="0">
                {appliedFilters.map((appliedFilter: AppliedFilter, index: number) => {
                    let FilterComponent = filters[appliedFilter.filterName];
                    return <Card key={index + appliedFilter.filterName}>
                        <Card.Header style={{ padding: 5, cursor: 'pointer' }}>
                            <Accordion.Toggle as="div" eventKey={"" + index}>
                                <Button variant={appliedFilter.filter === undefined ? "danger" : "primary"}>{appliedFilter.filterName}</Button>
                                <span className="ml-3">{appliedFilter.titleText}</span>
                                {index !== 0 && <Button variant="danger" style={{ float: 'right' }} onClick={removeFilter(index)}>-</Button>}
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey={"" + index}>
                            <Card.Body>
                                <FilterComponent outputCallback={filterComponentOutputCallback(index)} playlists={playlists} tracks={tracks} playlistsLoading={playlistsLoading} refreshPlaylist={refreshPlaylist} />
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>;
                })}
            </Accordion>

            <div className="mt-3 text-center">
                <InputGroup style={{ width: 'auto', display: 'inline-flex' }}>
                    <DropdownButton as={InputGroup.Prepend} variant="outline-primary" title={addFilterDropdownSelection} id="add-filter" >
                        {Object.keys(filters).map(filterName => <Dropdown.Item onClick={filterDropdownSelect(filterName)}>{filterName}</Dropdown.Item>)}
                    </DropdownButton>
                    <InputGroup.Append>
                        <Button onClick={addFilter}>Add</Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>

        </Container>
    </>
}

export default Tools;
