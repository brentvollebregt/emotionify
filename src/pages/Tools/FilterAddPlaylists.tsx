import React, { useState, useEffect } from 'react';
import { FilterFunctionProps } from './filter';
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from '../../models/Spotify';
import Button from 'react-bootstrap/Button';

interface IProps extends FilterFunctionProps { 
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds },
    tracks: { [key: string]: TrackWithAudioFeatures },
    playlistsLoading: Set<string>,
}

const FilterAddPlaylists: React.FunctionComponent<IProps> = (props: IProps) => {
    const { playlists, tracks, playlistsLoading, outputCallback} = props;

    const [count, setCount] = useState(0);

    const dos = () => {
        setCount(c => c + 1);
        outputCallback(
            (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] => tracks.reverse(),
            '[Selected Playlists] ' + count
        );
    }

    return <>
        <p className="lead">Add playlists to the current track list</p>
        <Button onClick={dos}>Trigger</Button>
    </>
}

export default FilterAddPlaylists;
