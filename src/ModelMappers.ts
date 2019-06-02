import { ReducedSpotifyUser, ReducedSpotifyPlaylist, ReducedSpotifyTrack, ReducedSpotifyTrackAudioFeatures } from './Models'

// Reduce SpotifyApi.CurrentUsersProfileResponse. Take in the sub-class SpotifyApi.UserObjectPublic as all required fields are in this.
export function ReduceCurrentUsersProfile(user: SpotifyApi.UserObjectPublic): ReducedSpotifyUser {
    return {
        display_name: user.display_name,
        id: user.id,
        uri: user.uri,
        href: user.href
    }
}

// Reduce SpotifyApi.PlaylistObjectSimplified.
export function ReducePlaylistObjectSimplified(playlist: SpotifyApi.PlaylistObjectSimplified): ReducedSpotifyPlaylist {
    return {
        track_ids: [],
        id: playlist.id,
        uri: playlist.uri,
        tracks: {
            total: playlist.tracks.total
        },
        images: playlist.images.map(i => i.url),
        name: playlist.name,
        owner: ReduceCurrentUsersProfile(playlist.owner),
        public: playlist.public,
        href: playlist.href,
        external_urls: {
            spotify: playlist.external_urls.spotify
        }
    }
}

// Reduce SpotifyApi.TrackObjectFull.
export function ReduceTrackObjectFull(track: SpotifyApi.TrackObjectFull): ReducedSpotifyTrack {
    return {
        audio_features: null,
        id: track.id,
        uri: track.uri,
        album: {
            id: track.album.id,
            uri: track.album.uri,
            name: track.album.name
        },
        artists: track.artists.map(a => {return {id: a.id, uri: a.uri, name: a.name}}),
        duration_ms: track.duration_ms,
        name: track.name,
    }
}

// Reduce SpotifyApi.AudioFeaturesObject.
export function ReduceAudioFeaturesObject(audio_featues: SpotifyApi.AudioFeaturesObject): ReducedSpotifyTrackAudioFeatures {
    return {
        id: audio_featues.id,
        uri: audio_featues.uri,
        acousticness: audio_featues.acousticness,
        danceability: audio_featues.danceability,
        duration_ms: audio_featues.duration_ms,
        energy: audio_featues.energy,
        instrumentalness: audio_featues.instrumentalness,
        key: audio_featues.key,
        liveness: audio_featues.liveness,
        loudness: audio_featues.loudness,
        mode: audio_featues.mode,
        speechiness: audio_featues.speechiness,
        tempo: audio_featues.tempo,
        time_signature: audio_featues.time_signature,
        valence: audio_featues.valence
    }
}
