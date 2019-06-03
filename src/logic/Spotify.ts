import SpotifyWebApi from 'spotify-web-api-js';
import { chunkList } from './Utils';
import { SpotifyUser, SpotifyPlaylist, SpotifyTrack, SpotifyTrackAudioFeatures } from './../Models';
import { ReduceCurrentUsersProfile, ReducePlaylistObjectSimplified, ReduceTrackObjectFull, ReduceAudioFeaturesObject } from './ModelMappers';

const playlistRequestLimit = 20;
const playlistTrackRequestLimit = 100;
const trackFeaturesRequestLimit = 100;
const maxRequestsSentAtOnce = 10;

export interface OffsetLimit {
    offset: number,
    limit: number
}

function offsetCalculation(limit: number, total: number): OffsetLimit[] {
    // Calculate request offsets needed to be performed
    let request_blocks: OffsetLimit[] = [];
    let accounted_for = 0;
    for (let i = 0; accounted_for < total; i++) {
        request_blocks.push({ offset: i * limit, limit: limit });
        accounted_for += limit;
    }
    return (request_blocks);
}

export function tokenValid(token: string | null, expiry: Date): token is string {
    // Checks if a token is not null and is within the expiry
    return token !== null && expiry > new Date();
}

export function getUser(token: string): Promise<SpotifyUser> {
    // Gets the user associated with a provided token
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token);
    return spotifyApi.getMe()
        .then(r => ReduceCurrentUsersProfile(r));
}

export function getUserPlaylists(token: string, user: SpotifyUser): Promise<SpotifyPlaylist[]> {
    // Gets all playlists for a user. Fast as it makes more than one request a time.
    return new Promise((resolve, reject) => {
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        let playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
        let offset = 0;
        let limit = playlistRequestLimit;

        spotifyApi.getUserPlaylists(user.id, { offset, limit })
            .then(async data => {
                playlists = [...playlists, ...data.items]; // Store data from initial request

                // Calculate requests to be made and chunk them
                let request_blocks = offsetCalculation(limit, data.total).splice(1); // Ignore the first as we have already made that request
                let request_blocks_chunked = chunkList(request_blocks, maxRequestsSentAtOnce);

                for (let i = 0; i < request_blocks_chunked.length; i++) {
                    // Start all requests in this chunk
                    let promises: Promise<SpotifyApi.ListOfUsersPlaylistsResponse>[] = [];
                    for (let j = 0; j < request_blocks_chunked[i].length; j++) {
                        promises.push( spotifyApi.getUserPlaylists(user.id, request_blocks_chunked[i][j]) );
                    }
                    // Wait for each request and get data
                    let promise_data = await Promise.all(promises); // TODO: Catch errors
                    playlists = [...playlists, ...promise_data.map(i => i.items).flat()];
                }

                resolve(playlists.map(p => ReducePlaylistObjectSimplified(p)));

                }, err => {
                    reject(err);
                });
    });
}

export function getPlaylistTracks(token: string, playlist: SpotifyPlaylist): Promise<SpotifyTrack[]> {
    // Gets all tracks in a playlist. Fast as it makes more than one request a time.
    return new Promise((resolve, reject) => {
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        let tracks: SpotifyApi.TrackObjectFull[] = [];
        let offset = 0;
        let limit = playlistTrackRequestLimit;

        spotifyApi.getPlaylistTracks(playlist.id, { offset, limit })
            .then(async data => {
                tracks = [...tracks, ...data.items.map(i => i.track)]; // Store data from initial request

                // Calculate requests to be made and chunk them
                let request_blocks = offsetCalculation(limit, data.total).splice(1); // Ignore the first as we have already made that request
                let request_blocks_chunked = chunkList(request_blocks, maxRequestsSentAtOnce);

                for (let i = 0; i < request_blocks_chunked.length; i++) {
                    // Start all requests in this chunk
                    let promises: Promise<SpotifyApi.PlaylistTrackResponse>[] = [];
                    for (let j = 0; j < request_blocks_chunked[i].length; j++) {
                        promises.push( spotifyApi.getPlaylistTracks(playlist.id, request_blocks_chunked[i][j]) );
                    }
                    // Wait for each request and get data
                    let promise_data = await Promise.all(promises); // TODO: Catch errors
                    tracks = [...tracks, ...promise_data.map(i => i.items).flat().map(i => i.track)];
                }

                resolve(tracks.map(t => ReduceTrackObjectFull(t)));

                }, err => {
                    reject(err);
                });
    });
}

export function getFeaturesForTracks(token: string, track_ids: string[]): Promise<SpotifyTrackAudioFeatures[]> {
    // Gets all the audio features for a list of tracks. Fast as it makes more than one request a time.
    return new Promise(async (resolve, reject) => {
        let spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        let features: SpotifyApi.AudioFeaturesObject[] = [];
        let track_groups = chunkList(track_ids, trackFeaturesRequestLimit); // Tracks for each request
        let track_groups_chunked = chunkList(track_groups, maxRequestsSentAtOnce); // Batches of requests

        for (let i = 0; i < track_groups_chunked.length; i++) {
            // Start all requests in this chunk
            let promises: Promise<SpotifyApi.MultipleAudioFeaturesResponse>[] = [];
            for (let j = 0; j < track_groups_chunked[i].length; j++) {
                promises.push( spotifyApi.getAudioFeaturesForTracks(track_groups_chunked[i][j]) );
            }
            // Wait for each request and get data
            let promise_data = await Promise.all(promises); // TODO: Catch errors
            features = [...features, ...promise_data.map(i => i.audio_features).flat()];
        }

        resolve(features.map(af => ReduceAudioFeaturesObject(af)));

    });
}

export function createPlaylist(token: string, user: SpotifyUser, name: string, isPublic: boolean, track_uris: string[]): Promise<SpotifyPlaylist> {
        let spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);
        
        return spotifyApi.createPlaylist(user.id, {
            name: name,
            public: isPublic,
            description: 'Created by emotionify.nitratine.net'
        })
            .then(async playlist => {
                // Chunk into blocks of 100
                let chunks: string[][] = chunkList(track_uris, 100);

                // Add tracks in order
                for (let i = 0; i < chunks.length; i++) {
                    await spotifyApi.addTracksToPlaylist(playlist.id, chunks[i]);  // TODO: Catch errors
                }

                // Manually set the amount of tracks rather than requesting for it again
                playlist.tracks.total = track_uris.length; 
                return ReducePlaylistObjectSimplified(playlist);
            });
}
