export interface SpotifyData {
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: {
        [key: string]: PlaylistObjectSimplifiedWithTrackIds
    },
    tracks: {
        [key: string]: SpotifyApi.TrackObjectFull
    },
    audioFeatures: {
        [key: string]: SpotifyApi.AudioFeaturesObject
    },
}

export interface Token {
    value: string,
    expiry: Date
}

export interface PlaylistObjectSimplifiedWithTrackIds extends SpotifyApi.PlaylistObjectSimplified {
    track_ids: string[]
}
