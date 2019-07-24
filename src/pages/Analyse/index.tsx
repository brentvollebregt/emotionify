import React, { useState } from 'react';
import { useTitle } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import PlaylistSelectionTable from '../../components/PlaylistSelection';
import PlaylistDetails from '../../components/PlaylistDetails';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';
import { PlaylistObjectSimplifiedWithTrackIds, TrackWithAudioFeatures } from '../../models/Spotify';

const max_playlists_selected = 3;

interface IProps {
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds },
    tracks: { [key: string]: TrackWithAudioFeatures },
    playlistsLoading: Set<string>,
    refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void,
}

const Home: React.FunctionComponent<IProps> = (props: IProps) => {
    const { user, playlists, tracks, playlistsLoading, refreshPlaylist } = props;

    useTitle('Analyse - Emotionify');
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

    const header = <Container className="mt-3 mb-4">
        <h1 className="text-center">Analyse A Playlist</h1>
        <p className="text-center lead col-md-7 mx-auto">Here you can select a playlist and analyse each audio feature over the whole playlist.</p>
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
                multipleSelectionsAllowed={true}
                onPlaylistSelectionChange={onPlaylistSelectionChange} 
            />

            {selectedPlaylistIds.length > 0 && <>
                <hr />

                <div className="d-block d-md-flex">
                    {selectedPlaylistIds.map(pid => <div style={{ width: '100%' }}>
                        <PlaylistDetails 
                            playlists={[playlists[pid]]}
                            tracksLoading={playlistsLoading.has(pid)}
                        />
                    </div>)}
                </div>

            
            </>}

        </Container>
    </>
}

export default Home;
