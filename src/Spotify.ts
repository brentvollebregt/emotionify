import SpotifyWebApi from 'spotify-web-api-js';
import { chunkList } from './Utils'

const playlistRequestLimit = 20;
const playlistTrackRequestLimit = 100;
const trackFeaturesRequestLimit = 100;

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

export function getUserPlaylists(token: string, user: SpotifyApi.CurrentUsersProfileResponse): Promise<SpotifyApi.PlaylistObjectSimplified[]> {
    // Gets all playlists for a user
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

export function getPlaylistTracks(token: string, playlist: SpotifyApi.PlaylistObjectSimplified): Promise<SpotifyApi.TrackObjectFull[]> {
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
