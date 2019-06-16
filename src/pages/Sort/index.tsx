import React, { useState } from 'react';
import { navigate, useTitle } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { availableSortingMethods, IndexedTrackId, sort, SpotifyTrackWithIndexes } from '../../logic/PointSorting';
import { createPlaylist } from '../../logic/Spotify';
import { PlaylistObjectSimplifiedWithTrackIds, availableTrackAudioFeatures, TrackWithAudioFeatures } from '../../models/Spotify';
import { Token } from '../../models/Spotify'
import PlaylistSelectionTable from './PlaylistSelectionTable';
import PlaylistDetails from './PlaylistDetails';
import PlotTracks from './PlotTracks';
import TrackTable from './TrackTable';
import TrackSortControl from './TrackSortControl';
import AccordionDynamicHeader from './AccordionDynamicHeader';
import Export from './Export';

interface IProps {
    token: Token | undefined,
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds },
    tracks: { [key: string]: TrackWithAudioFeatures },
    refreshPlaylist: (playlist: SpotifyApi.PlaylistObjectSimplified) => void,
    refreshUsersPlaylists: () => void
}

interface selectedAxis {
    x: string,
    y: string
}

export const Sort: React.FunctionComponent<IProps> = (props: IProps) => {
    const { token, user, playlists, tracks } = props;
    const { refreshPlaylist, refreshUsersPlaylists } = props;

    useTitle('Emotionify - Sort');
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | undefined>(undefined);
    const [selectedAxis, setSelectedAxis] = useState<selectedAxis>({ x: 'Valence', y: 'Energy' });
    const [sortingMethod, setSortingMethod] = useState<string>('Distance From Origin');
    // const [sortedTracks, setSortedTracks] = useState<string>('Distance From Origin');

    const authorize = () => navigate('/spotify-authorization');

    const onPlaylistSelected = (playlist_id: string) => {
        setSelectedPlaylist(playlist_id);
        refreshPlaylist(playlists[playlist_id]);
    }
    const onXAxisSelect = (selection: string) => setSelectedAxis({ ...selectedAxis, x: selection });
    const onYAxisSelect = (selection: string) => setSelectedAxis({ ...selectedAxis, y: selection });
    const onSortMethodSelect = (selection: string) => setSortingMethod(selection);

    // Sort tracks
    let sortedTrackIds: IndexedTrackId[] = [];
    if (selectedPlaylist !== undefined && selectedPlaylist in playlists) {
        console.log(selectedPlaylist, selectedAxis.x, selectedAxis.y, sortingMethod);
        const selected_playlist_track_ids: string[] = playlists[selectedPlaylist].track_ids;
        const selected_playlist_tracks: TrackWithAudioFeatures[] = Object.values(tracks)
            .filter(t => selected_playlist_track_ids.indexOf(t.id) !== -1)
            .sort((a: TrackWithAudioFeatures, b: TrackWithAudioFeatures): number => { // Do a sort to put them in the correct order again (fixes incorrect order due to overlapping playlists)
                const aIndex = selected_playlist_track_ids.indexOf(a.id);
                const bIndex = selected_playlist_track_ids.indexOf(b.id);
                return aIndex === bIndex ? 0 : aIndex > bIndex ? 1 : -1
            });
        sortedTrackIds = sort(
            selected_playlist_tracks, 
            availableTrackAudioFeatures[selectedAxis.x], 
            availableTrackAudioFeatures[selectedAxis.y], 
            availableSortingMethods[sortingMethod]
        )
    }
    const sorted_tracks: TrackWithAudioFeatures[] = sortedTrackIds.map(t => tracks[t.id]);
    const sorted_tracks_with_indexes: SpotifyTrackWithIndexes[] = sortedTrackIds.map(it => { return { ...tracks[it.id], ...it } });

    const onExport = (name: string, isPublic: boolean): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            if (token !== undefined && sortedTrackIds !== undefined && user !== undefined) {
                // Map the sorted tracks to uris
                let track_uris: string[] = sortedTrackIds.map(st => tracks[st.id].uri);
                // Create the playlist
                let success: boolean = await createPlaylist(token.value, user, name, isPublic, track_uris)
                    .then(playlist => {
                        refreshUsersPlaylists(); // Get the new playlist by updating the playlist list
                        return true;
                    }, err => {
                        console.error(err);
                        return false;
                    });
                resolve(success);
            }
            resolve(false);
        });
    }

    const header = <Container className="mt-3 mb-4">
        <h1 className="text-center" onClick={() => {console.log('props:', props)}}>Playlist Sort</h1>
        <p className="text-center lead col-md-7 mx-auto">Here you can select a playlist and look at how the new playlist is sorted. You can then create the new playlist or select a different playlist.</p>
    </Container>;

    if (token === undefined) {
        return <>
            {header}
            <Container className="text-center">
                <h2>Login to Spotify</h2>
                <p>To get access to your playlists and the ability to create playlists, you need to sign into Spotify.</p>
                <Button onClick={authorize}>Sign Into Spotify</Button>
            </Container>
        </>
    }

    return <>
        {header}
        <Container className="text-center mb-5">

            {playlists && <PlaylistSelectionTable playlists={Object.values(playlists)} onPlaylistSelected={onPlaylistSelected} />}

            <hr />

            {selectedPlaylist !== undefined && selectedPlaylist in playlists && <>
                <div className="mb-4">
                    <PlaylistDetails playlist={playlists[selectedPlaylist]} />
                </div>

                <div className="mb-4">
                    <PlotTracks 
                        tracks={sorted_tracks}
                        selected_x_axis={availableTrackAudioFeatures[selectedAxis.x]}
                        selected_y_axis={availableTrackAudioFeatures[selectedAxis.y]}
                        selected_x_axis_name={selectedAxis.x}
                        selected_y_axis_name={selectedAxis.y}
                    />
                </div>

                <div className="mb-3">
                    <TrackSortControl 
                        available_audio_features={Object.keys(availableTrackAudioFeatures)} 
                        available_track_sorting_methods={Object.keys(availableSortingMethods)}
                        selected_x_axis={selectedAxis.x}
                        selected_y_axis={selectedAxis.y}
                        selected_sorting_method={sortingMethod}
                        onXAxisSelect={onXAxisSelect}
                        onYAxisSelect={onYAxisSelect}
                        onSortMethodSelect={onSortMethodSelect}
                    />
                </div>

                {playlists[selectedPlaylist].tracks.total !== sortedTrackIds.length && 
                    <Alert variant="warning" style={{display: 'inline-block'}}>
                        Warning: Duplicates in this playlist will be removed
                    </Alert>
                }

                <div className="mb-5">
                    <AccordionDynamicHeader
                        contractedHeader={'Songs in Playlist (click to expand)'}
                        expandedHeader={'Songs in Playlist (click to collapse)'}
                        initiallyExpanded={false}
                    >
                        <TrackTable 
                            tracks={sorted_tracks_with_indexes}
                            x_audio_feature={availableTrackAudioFeatures[selectedAxis.x]}
                            x_audio_feature_name={selectedAxis.x}
                            y_audio_feature={availableTrackAudioFeatures[selectedAxis.y]}
                            y_audio_feature_name={selectedAxis.y}
                        />
                    </AccordionDynamicHeader>
                </div>

                <div className="mb-5">
                    <Export onExport={onExport}/>
                </div>
            </>}

        </Container>
    </>
}

export default Sort;
