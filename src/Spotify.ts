import SpotifyWebApi from 'spotify-web-api-js';
import { chunkList } from './Utils';
import { OffsetLimit } from './Models';

// TODO: Don't use recursive calls, execute one, check what is left and make them all at once (or do 10 at a time)

const playlistRequestLimit = 20;
const playlistTrackRequestLimit = 100;
const trackFeaturesRequestLimit = 100;
const maxRequestsSentAtOnce = 10;

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

export function getUser(token: string): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    // Gets the user associated with a provided token
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token);
    return spotifyApi.getMe();
}

export function getUserPlaylistsRecursive(token: string, user: SpotifyApi.CurrentUsersProfileResponse): Promise<SpotifyApi.PlaylistObjectSimplified[]> {
    // Gets all playlists for a user. Slow as it waits for each request before making the next.
    return new Promise((resolve, reject) => {
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        let playlists: SpotifyApi.PlaylistObjectSimplified[] = [];

        const requestPlaylists = (offset: number, limit: number) => {
            spotifyApi.getUserPlaylists(user.id, { offset, limit })
                .then(data => {
                    playlists = [...playlists, ...data.items];
                    if (data.total > offset + limit) { // Need to request more
                        requestPlaylists(offset + limit, limit);
                    } else {
                        resolve(playlists);
                    }
                }, err => {
                    reject(err);
                });
        }

        requestPlaylists(0, playlistRequestLimit);
    });
}

export function getUserPlaylists(token: string, user: SpotifyApi.CurrentUsersProfileResponse): Promise<SpotifyApi.PlaylistObjectSimplified[]> {
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
                    let promise_data = await Promise.all(promises);
                    playlists = [...playlists, ...promise_data.map(i => i.items).flat()];
                }

                resolve(playlists);

                }, err => {
                    reject(err);
                });
    });
}

export function getPlaylistTracksRecursive(token: string, playlist: SpotifyApi.PlaylistObjectSimplified): Promise<SpotifyApi.TrackObjectFull[]> {
    // Gets all tracks in a playlist. Slow as it waits for each request before making the next.
    return new Promise((resolve, reject) => {
        let spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        let tracks: SpotifyApi.TrackObjectFull[] = [];

        const requestSongs = (offset: number, limit: number) => {
            spotifyApi.getPlaylistTracks(playlist.id, { offset, limit })
                .then(data => {
                    tracks = [ ...tracks, ...(data.items.map(i => i.track)) ];
                    if (data.total > offset + limit) { // Need to request more
                        requestSongs(offset + limit, limit);
                    } else { // End of recursion
                        resolve(tracks);
                    }
                }, err => {
                    reject(err);
                });
        }

        requestSongs(0, playlistTrackRequestLimit);
    });
}

export function getPlaylistTracks(token: string, playlist: SpotifyApi.PlaylistObjectSimplified): Promise<SpotifyApi.TrackObjectFull[]> {
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
                    let promise_data = await Promise.all(promises);
                    tracks = [...tracks, ...promise_data.map(i => i.items).flat().map(i => i.track)];
                }

                resolve(tracks);

                }, err => {
                    reject(err);
                });
    });
}

export function getFeaturesForTracks(token: string, track_ids: string[]): Promise<SpotifyApi.AudioFeaturesObject[]> {
    return new Promise((resolve, reject) => {
        let spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        let features: SpotifyApi.AudioFeaturesObject[] = [];
        let tracks_chunked = chunkList(track_ids, trackFeaturesRequestLimit);

        const requestFeatures = () => {
            let chunk = tracks_chunked.pop();
            if (chunk !== undefined) {
                spotifyApi.getAudioFeaturesForTracks(chunk)
                    .then(data => {
                        features = [...features, ...(data.audio_features)]
                        requestFeatures();
                    }, err => {
                        reject(err);
                    });

            } else {
                resolve(features);
            }
        }

        requestFeatures();
    });
}
