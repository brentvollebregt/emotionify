import React, { useState } from 'react';
import { useTitle } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Spinner from 'react-bootstrap/Spinner';
import PlaylistSelectionTable from '../../components/PlaylistSelection';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';
import BoxPlotAudioFeatureComparison from './BoxPlotAudioFeatureComparison';
import ScatterPlotDualAudioFeatureComparison from './ScatterPlotDualAudioFeatureComparison';
import RadarChartAudioFeatureComparison from './RadarChartAudioFeatureComparison';
import { PlaylistObjectSimplifiedWithTrackIds, availableTrackAudioFeatures, TrackWithAudioFeatures } from '../../models/Spotify';

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
    const [oneDimensionComparisonAudioFeature, setOneDimensionComparisonAudioFeature] = useState('Valence');
    const [twoDimensionComparisonAudioFeatureX, setTwoDimensionComparisonAudioFeatureX] = useState('Valence');
    const [twoDimensionComparisonAudioFeatureY, setTwoDimensionComparisonAudioFeatureY] = useState('Energy');

    const onPlaylistSelectionChange = (playlist_ids: string[]) => {
        if (playlist_ids.length) {
            setSelectedPlaylistIds(playlist_ids);
            playlist_ids.forEach(playlist_id => {
                if (playlists[playlist_id].track_ids.length === 0) {
                    refreshPlaylist(playlists[playlist_id]);
                }
            });
        }
    }
    const onOneDimensionComparisonAudioFeatureSelection = (audio_feature: string) => () => setOneDimensionComparisonAudioFeature(audio_feature);
    const onTwoDimensionComparisonAudioFeatureXSelection = (audio_feature: string) => () => setTwoDimensionComparisonAudioFeatureX(audio_feature);
    const onTwoDimensionComparisonAudioFeatureYSelection = (audio_feature: string) => () => setTwoDimensionComparisonAudioFeatureY(audio_feature);

    const selectedPlaylists = selectedPlaylistIds.map(pid => playlists[pid]);

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

            {playlistsLoading.size > 0 && <div className="my-4">
                <Spinner animation="border" />
            </div>}

            {selectedPlaylistIds.length > 0 && <>
                <hr />

                <div className="mb-5">
                    <h4 className="mb-3">Single Audio Feature Comparison</h4>

                    <InputGroup className="mb-3" style={{display: 'inline-flex', width: 'auto'}}>
                        <InputGroup.Prepend>
                            <InputGroup.Text>Audio Feature</InputGroup.Text>
                        </InputGroup.Prepend>
                        <DropdownButton
                            as={InputGroup.Append}
                            variant="outline-secondary"
                            title={oneDimensionComparisonAudioFeature}
                            id="X-Axis"
                        >
                            {Object.keys(availableTrackAudioFeatures).map(audio_feature =>
                                <Dropdown.Item key={audio_feature} onClick={onOneDimensionComparisonAudioFeatureSelection(audio_feature)}>{audio_feature}</Dropdown.Item>
                            )}
                        </DropdownButton>
                    </InputGroup>

                    <BoxPlotAudioFeatureComparison
                        selectedPlaylists={selectedPlaylists}
                        tracks={tracks}
                        audioFeature={availableTrackAudioFeatures[oneDimensionComparisonAudioFeature].key}
                        min={availableTrackAudioFeatures[oneDimensionComparisonAudioFeature].min}
                        max={availableTrackAudioFeatures[oneDimensionComparisonAudioFeature].max}
                    />
                </div>

                <div className="mb-5">
                    <h4 className="mb-3">Dual Audio Feature Comparison</h4>

                    <div className="mb-3">
                        <InputGroup className="mr-3 mt-1" style={{display: 'inline-flex', width: 'auto'}}>
                            <InputGroup.Prepend>
                                <InputGroup.Text>X-Axis ( ↔ )</InputGroup.Text>
                            </InputGroup.Prepend>
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={twoDimensionComparisonAudioFeatureX}
                                id="X-Axis"
                            >
                                {Object.keys(availableTrackAudioFeatures).map(audio_feature =>
                                    <Dropdown.Item key={audio_feature} onClick={onTwoDimensionComparisonAudioFeatureXSelection(audio_feature)}>{audio_feature}</Dropdown.Item>
                                )}
                            </DropdownButton>
                        </InputGroup>

                        <InputGroup className="mt-1" style={{display: 'inline-flex', width: 'auto'}}>
                            <InputGroup.Prepend>
                                <InputGroup.Text>Y-Axis ( ↕ )</InputGroup.Text>
                            </InputGroup.Prepend>
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={twoDimensionComparisonAudioFeatureY}
                                id="X-Axis"
                            >
                                {Object.keys(availableTrackAudioFeatures).map(audio_feature =>
                                    <Dropdown.Item key={audio_feature} onClick={onTwoDimensionComparisonAudioFeatureYSelection(audio_feature)}>{audio_feature}</Dropdown.Item>
                                )}
                            </DropdownButton>
                        </InputGroup>
                    </div>

                    <ScatterPlotDualAudioFeatureComparison
                        playlists={selectedPlaylists}
                        tracks={tracks}
                        x_audio_feature_name={twoDimensionComparisonAudioFeatureX}
                        y_audio_feature_name={twoDimensionComparisonAudioFeatureY}
                    />
                </div>

                <div className="mb-5">
                    <h4 className="mb-3">0-1 Range Audio Feature Comparison</h4>

                    <RadarChartAudioFeatureComparison 
                        playlists={selectedPlaylists}
                        tracks={tracks}
                    />
                </div>

            </>}
        </Container>
    </>
}

export default Compare;
