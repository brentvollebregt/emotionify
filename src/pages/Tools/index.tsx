import React, { useState, useEffect } from 'react';
import { useTitle } from 'hookrouter';
import FilterAddPlaylists from './FilterAddPlaylists';
import FilterReverse from './FilterReverse';
import FilterRandomise from './FilterRandomise';
import FilterAudioFeaturePredicate from './FilterAudioFeaturePredicate';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from '../../models/Spotify';

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
    'Randomise': FilterRandomise,
    'Filter Audio Feature': FilterAudioFeaturePredicate,
}

const track_identity_function = (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] => tracks;

const Tools: React.FunctionComponent<IProps> = (props: IProps) => {
    const { user, playlists, tracks, playlistsLoading, refreshPlaylist } = props;

    useTitle('Emotionify - Tools');
    const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([{
        filterName: 'Add Playlist',
        filter: track_identity_function,
        titleText: ''
    }]);
    const [addFilterDropdownSelection, setAddFilterDropdownSelection] = useState(Object.keys(filters)[0]);
    const [activeCardEventKey, setActiveCardEventKey] = useState("0"); // Need to keep track of these as dropdowns in the accordion will close cards
    const [filteredTracks, setFilteredTracks] = useState<TrackWithAudioFeatures[]>([]);

    useEffect(() => { // Apply new filters as they appear
        const currentFilters = appliedFilters.map(af => af.filter);
        if (currentFilters.indexOf(undefined) === -1) {
            setFilteredTracks(appliedFilters
                .map(af => af.filter as (tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[])
                .reduce((accumulator: TrackWithAudioFeatures[], filter) => filter(accumulator), []))
        } else {
            setFilteredTracks([]);
        }
    }, [appliedFilters]);

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

    const onCardHeaderClick = (eventKey: string) => () => setActiveCardEventKey(activeCardEventKey !== eventKey ? eventKey : '');
    const filterDropdownSelect = (filterName: string) => () => setAddFilterDropdownSelection(filterName);
    const addFilter = () => {
        setActiveCardEventKey(appliedFilters.length + '');
        setAppliedFilters(currentlyAppliedFilters => [...currentlyAppliedFilters, {filterName: addFilterDropdownSelection, filter: undefined, titleText: ''}]);
    };
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
    };

    return <>
        {header}

        <Container className="mb-5">

            <Accordion activeKey={activeCardEventKey}>
                {appliedFilters.map((appliedFilter: AppliedFilter, index: number) => {
                    let FilterComponent = filters[appliedFilter.filterName];
                    return <Card key={index + appliedFilter.filterName} style={{ overflow: 'visible' }}>
                        <Card.Header style={{ padding: 5, cursor: 'pointer' }} onClick={onCardHeaderClick("" + index)}>
                            <Button variant={appliedFilter.filter === undefined ? "danger" : "primary"}>{appliedFilter.filterName}</Button>
                            <span className="ml-3">{appliedFilter.titleText}</span>
                            {index !== 0 && <Button variant="danger" style={{ float: 'right' }} onClick={removeFilter(index)}>-</Button>}
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
                        {Object.keys(filters).map(filterName => <Dropdown.Item key={filterName} onClick={filterDropdownSelect(filterName)}>{filterName}</Dropdown.Item>)}
                    </DropdownButton>
                    <InputGroup.Append>
                        <Button onClick={addFilter}>Add</Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>

            <div className="mt-3 text-center">
                {filteredTracks.map(track => <div key={track.name}>{track.name}</div>)}
            </div>

        </Container>
    </>
}

export default Tools;
