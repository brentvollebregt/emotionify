export interface SpotifyData {
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: {
        [key: string]: SpotifyApi.PlaylistObjectSimplified
    },
    tracks: {
        [key: string]: SpotifyApi.PlaylistTrackObject
    },
    audioFeatures: {
        [key: string]: SpotifyApi.AudioFeaturesObject
    },
}

export interface Token {
    value: string,
    expiry: Date
}
