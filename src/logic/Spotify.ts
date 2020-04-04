import SpotifyWebApi from "spotify-web-api-js";
import { chunkList } from "./Utils";
import {
  Token,
  PlaylistObjectSimplifiedWithTrackIds,
  TrackWithAudioFeatures
} from "../models/Spotify";

const playlistRequestLimit = 20;
const playlistTrackRequestLimit = 100;
const trackFeaturesRequestLimit = 100;
const maxRequestsSentAtOnce = 10;

export interface OffsetLimit {
  offset: number;
  limit: number;
}

function offsetCalculation(limit: number, total: number): OffsetLimit[] {
  // Calculate request offsets needed to be performed
  let request_blocks: OffsetLimit[] = [];
  let accounted_for = 0;
  for (let i = 0; accounted_for < total; i++) {
    request_blocks.push({ offset: i * limit, limit: limit });
    accounted_for += limit;
  }
  return request_blocks;
}

export function getAllSpotifyUsersPlaylists(
  token: Token,
  user: SpotifyApi.UserObjectPrivate
): Promise<PlaylistObjectSimplifiedWithTrackIds[]> {
  // Gets all playlists for a user. Fast as it makes more than one request a time.
  return new Promise((resolve, reject) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token.value);

    let playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
    const offset = 0;
    const limit = playlistRequestLimit;

    let rejected = false;

    spotifyApi.getUserPlaylists(user.id, { offset, limit }).then(
      async (data) => {
        playlists = [...playlists, ...data.items]; // Store data from initial request

        // Calculate requests to be made and chunk them
        const request_blocks = offsetCalculation(limit, data.total).splice(1); // Ignore the first as we have already made that request
        const request_blocks_chunked = chunkList(request_blocks, maxRequestsSentAtOnce);

        for (let i = 0; i < request_blocks_chunked.length; i++) {
          // Start all requests in this chunk
          let promises: Promise<SpotifyApi.ListOfUsersPlaylistsResponse>[] = [];
          for (let j = 0; j < request_blocks_chunked[i].length; j++) {
            promises.push(spotifyApi.getUserPlaylists(user.id, request_blocks_chunked[i][j]));
          }
          // Wait for each request and get data
          await Promise.all(promises)
            .then((new_playlists) => {
              playlists = [...playlists, ...new_playlists.map((i) => i.items).flat()];
            })
            .catch((err) => {
              reject(err);
              rejected = true;
            });
          if (rejected) {
            break;
          }
        }

        // Convert to PlaylistObjectSimplifiedWithTrackIds using a blank list
        resolve(
          playlists.map((p) => {
            return { ...p, track_ids: [] };
          })
        );
      },
      (err) => {
        reject(err);
      }
    );
  });
}

export function getAllTracksInPlaylist(
  token: Token,
  playlist: SpotifyApi.PlaylistObjectSimplified
): Promise<TrackWithAudioFeatures[]> {
  // Gets all tracks in a playlist. Fast as it makes more than one request a time.
  return new Promise((resolve, reject) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token.value);

    let tracks: SpotifyApi.TrackObjectFull[] = [];
    const offset = 0;
    const limit = playlistTrackRequestLimit;

    let rejected = false;

    spotifyApi.getPlaylistTracks(playlist.id, { offset, limit }).then(
      async (data) => {
        tracks = [...tracks, ...data.items.map((i) => i.track)]; // Store data from initial request

        // Calculate requests to be made and chunk them
        const request_blocks = offsetCalculation(limit, data.total).splice(1); // Ignore the first as we have already made that request
        const request_blocks_chunked = chunkList(request_blocks, maxRequestsSentAtOnce);

        for (let i = 0; i < request_blocks_chunked.length; i++) {
          // Start all requests in this chunk
          let promises: Promise<SpotifyApi.PlaylistTrackResponse>[] = [];
          for (let j = 0; j < request_blocks_chunked[i].length; j++) {
            promises.push(spotifyApi.getPlaylistTracks(playlist.id, request_blocks_chunked[i][j]));
          }
          // Wait for each request and get data
          await Promise.all(promises)
            .then((new_tracks) => {
              tracks = [
                ...tracks,
                ...new_tracks
                  .map((i) => i.items)
                  .flat()
                  .map((i) => i.track)
              ];
            })
            .catch((err) => {
              reject(err);
              rejected = true;
            });
          if (rejected) {
            break;
          }
        }

        resolve(
          tracks.map((t) => {
            return { ...t, audio_features: undefined };
          })
        );
      },
      (err) => {
        reject(err);
      }
    );
  });
}

export function getAudioFeaturesForTracks(
  token: Token,
  track_ids: string[]
): Promise<SpotifyApi.AudioFeaturesObject[]> {
  // Gets all the audio features for a list of tracks. Fast as it makes more than one request a time.
  return new Promise(async (resolve, reject) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token.value);

    let features: SpotifyApi.AudioFeaturesObject[] = [];
    const track_groups = chunkList(track_ids, trackFeaturesRequestLimit); // Tracks for each request
    const track_groups_chunked = chunkList(track_groups, maxRequestsSentAtOnce); // Batches of requests

    let rejected = false;

    for (let i = 0; i < track_groups_chunked.length; i++) {
      // Start all requests in this chunk
      let promises: Promise<SpotifyApi.MultipleAudioFeaturesResponse>[] = [];
      for (let j = 0; j < track_groups_chunked[i].length; j++) {
        promises.push(spotifyApi.getAudioFeaturesForTracks(track_groups_chunked[i][j]));
      }
      // Wait for each request and get data
      await Promise.all(promises)
        .then((new_features) => {
          features = [...features, ...new_features.map((i) => i.audio_features).flat()];
        })
        .catch((err) => {
          reject(err);
          rejected = true;
        });
      if (rejected) {
        break;
      }
    }

    // if (!rejected) {

    // }
    resolve(features);
  });
}

export function createPlaylist(
  token: string,
  user: SpotifyApi.UserObjectPrivate,
  name: string,
  isPublic: boolean,
  track_uris: string[]
): Promise<PlaylistObjectSimplifiedWithTrackIds> {
  return new Promise((resolve, reject) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(token);

    return spotifyApi
      .createPlaylist(user.id, {
        name: name,
        public: isPublic,
        description: "Created by emotionify.nitratine.net"
      })
      .then(
        async (playlist) => {
          // Chunk into blocks of 100
          const chunks: string[][] = chunkList(track_uris, 100);

          // Add tracks in order
          for (let i = 0; i < chunks.length; i++) {
            await spotifyApi
              .addTracksToPlaylist(playlist.id, chunks[i])
              .catch((err) => reject(err));
          }

          // Manually set the amount of tracks rather than requesting for it again
          playlist.tracks.total = track_uris.length;
          resolve({ ...playlist, track_ids: [] });
        },
        (err) => {
          reject(err);
        }
      );
  });
}

// Get audio feature objects for tracks in a playlist that exist (aren't undefined for null) using all tracks requested
export function getSupportedTrackAudioFeaturesFromPlaylist(
  playlist: PlaylistObjectSimplifiedWithTrackIds,
  tracks: { [key: string]: TrackWithAudioFeatures }
): SpotifyApi.AudioFeaturesObject[] {
  return playlist.track_ids // Get the playlists tracks
    .filter((tid) => tid in tracks) // Make sure the track exists
    .map((tid) => tracks[tid].audio_features) // Get all audio features
    .filter((af): af is SpotifyApi.AudioFeaturesObject => af !== undefined && af !== null); // Filter out invalid audio features
}
