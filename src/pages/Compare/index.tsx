import React, { useState } from 'react';
import { useTitle } from 'hookrouter';
import Plot from 'react-plotly.js';
import Container from 'react-bootstrap/Container';
import PlaylistSelectionTable from '../../components/PlaylistSelection';
import PlaylistDetails from '../../components/PlaylistDetails';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';
import BoxPlotAudioFeatureComparison from './BoxPlotAudioFeatureComparison';
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from '../../models/Spotify';

const max_playlists_selected = 3;
const playlist_colours = ['#ed7d31', '#4372c4', '#7bc443'];

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

    const onPlaylistSelectionChange = (playlist_ids: string[], scrollOnFirstSelection: boolean = false) => {
        if (playlist_ids.length <= max_playlists_selected) {
            setSelectedPlaylistIds(playlist_ids);
            playlist_ids.forEach(playlist_id => {
                if (playlists[playlist_id].track_ids.length === 0) {
                    refreshPlaylist(playlists[playlist_id]);
                }
            });
        }
    }

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

                <div className="d-block d-md-flex mb-5">
                    {selectedPlaylists.map((playlist: PlaylistObjectSimplifiedWithTrackIds) => <div key={playlist.id} style={{ width: '100%', padding: '0 5px' }}>
                        <PlaylistDetails 
                            playlists={[playlist]}
                            tracksLoading={playlistsLoading.has(playlist.id)}
                        />
                        <hr style={{ border: 'solid 2px ' + selectedPlaylistColours[playlist.id], margin: '5px 0 0 0' }} />
                    </div>)}
                </div>

                <div>
                    <h4 className="mb-2">Single Audio Feature</h4>

                    {/* TODO Add dropdown to select audio feature */}
                    
                    <BoxPlotAudioFeatureComparison
                        selectedPlaylists={selectedPlaylists}
                        tracks={tracks}
                        playlistColours={selectedPlaylistColours}
                        audioFeature="valence"
                        min={0}
                        max={1}
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
