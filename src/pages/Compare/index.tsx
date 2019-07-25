import React, { useState } from 'react';
import { useTitle } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import PlaylistSelectionTable from '../../components/PlaylistSelection';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';
import BoxPlotAudioFeatureComparison from './BoxPlotAudioFeatureComparison';
import { PlaylistObjectSimplifiedWithTrackIds, availableTrackAudioFeatures, TrackWithAudioFeatures } from '../../models/Spotify';

const playlist_colours = ['rgb(93, 164, 214)', 'rgb(255, 144, 14)', 'rgb(44, 160, 101)', 'rgb(255, 65, 54)', 'rgb(207, 114, 255)', 'rgb(127, 96, 0)', 'rgb(255, 140, 184)', 'rgb(79, 90, 117)', 'rgb(222, 223, 0)'];

interface IProps {
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds },
    tracks: { [key: string]: TrackWithAudioFeatures },
    playlistsLoading: Set<string>,
    refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void,
}

const Compare: React.FunctionComponent<IProps> = (props: IProps) => {
    const { user, playlists, tracks, playlistsLoading, refreshPlaylist } = props;

    useTitle('Compare - Emotionify');
    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);
    const [oneDimensonComparisonAudioFeature, setOneDimensonComparisonAudioFeature] = useState('Valence');

    const onPlaylistSelectionChange = (playlist_ids: string[], scrollOnFirstSelection: boolean = false) => {
        if (playlist_ids.length <= playlist_colours.length) {
            setSelectedPlaylistIds(playlist_ids);
            playlist_ids.forEach(playlist_id => {
                if (playlists[playlist_id].track_ids.length === 0) {
                    refreshPlaylist(playlists[playlist_id]);
                }
            });
        }
    }
    const onOneDimensonComparisonAudioFeatureSelection = (audio_feature: string) => () => setOneDimensonComparisonAudioFeature(audio_feature);

    const selectedPlaylists = selectedPlaylistIds.map(pid => playlists[pid]);
    const selectedPlaylistColours: {[key: string]: string} = selectedPlaylistIds.map((pid: string, index: number) => ({ [pid]: playlist_colours[index] })).reduce((a, b) => ({ ...a, ...b }), {});

    const header = <Container className="mt-3 mb-4">
        <h1 className="text-center">Compare Playlists</h1>
        <p className="text-center lead col-md-7 mx-auto">Select playlists and compare them on one audio feature, two audio features or all audio features.</p>
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

    return <>
        {header}

        <Container className="text-center mb-5">

            <PlaylistSelectionTable 
                playlists={Object.values(playlists)}
                selectedPlaylistIds={selectedPlaylistIds}
                selectionsAllowed="Multiple"
                onPlaylistSelectionChange={onPlaylistSelectionChange} 
            />

            {selectedPlaylistIds.length > 0 && <>
                <hr />

                <div>
                    <h4 className="mb-3">Single Audio Feature Comparison</h4>

                    <InputGroup className="mb-3" style={{display: 'inline-flex', width: 'auto'}}>
                        <InputGroup.Prepend>
                            <InputGroup.Text>Audio Feature</InputGroup.Text>
                        </InputGroup.Prepend>
                        <DropdownButton
                            as={InputGroup.Append}
                            variant="outline-secondary"
                            title={oneDimensonComparisonAudioFeature}
                            id="X-Axis"
                        >
                            {Object.keys(availableTrackAudioFeatures).map(audio_feature =>
                                <Dropdown.Item key={audio_feature} onClick={onOneDimensonComparisonAudioFeatureSelection(audio_feature)}>{audio_feature}</Dropdown.Item>
                            )}
                        </DropdownButton>
                    </InputGroup>

                    <BoxPlotAudioFeatureComparison
                        selectedPlaylists={selectedPlaylists}
                        tracks={tracks}
                        playlistColours={selectedPlaylistColours}
                        audioFeature={availableTrackAudioFeatures[oneDimensonComparisonAudioFeature].key as keyof SpotifyApi.AudioFeaturesObject}
                        min={availableTrackAudioFeatures[oneDimensonComparisonAudioFeature].min}
                        max={availableTrackAudioFeatures[oneDimensonComparisonAudioFeature].max}
                    />
                </div>

                {/* TODO Add 2d comparison */}

                {/* TODO Add radial plot */}

                {/* TODO Add table showing averages */}

            </>}
        </Container>
    </>
}

export default Compare;
