export interface Token {
    value: string,
    expiry: Date
}

// Model to reduce SpotifyApi.CurrentUsersProfileResponse from SpotifyApi.getMe()
export interface ReducedSpotifyUser {
    id: string,
    uri: string,
    display_name: string | undefined,
    href: string
    // birthdate: string,
    // country: string,
    // email: string,
    // product: string
    // external_urls: SpotifyApi.ExternalUrlObject,
    // followers?: SpotifyApi.FollowersObject,
    // images?: SpotifyApi.ImageObject[],
    // type: "user",
}

// Model to reduce SpotifyApi.PlaylistObjectSimplified from SpotifyApi.getUserPlaylists()
export interface ReducedSpotifyPlaylist {
    track_ids: string[] // To hold ids of tracks in this playlist
    id: string,
    uri: string,
    tracks: {
        // href: string,
        total: number
    },
    images: string[], // From {height?: number, url: string, width?: number}[]
    name: string,
    owner: ReducedSpotifyUser, // From SpotifyApi.UserObjectPublic
    public: boolean,
    href: string,
    external_urls: {
        spotify: string
    }
    // collaborative: boolean,
    // snapshot_id: string,
    // type: "playlist",
}

// Model to reduce SpotifyApi.TrackObjectFull from SpotifyApi.getPlaylistTracks()
export interface ReducedSpotifyTrack {
    audio_features: ReducedSpotifyTrackAudioFeatures | null // To hold audio features with the track
    id: string,
    uri: string,
    album: { // From SpotifyApi.AlbumObjectSimplified
        id: string,
        uri: string,
        name: string
    },
    artists: { // From SpotifyApi.ArtistObjectSimplified[]
        id: string,
        uri: string,
        name: string
    }[],
    duration_ms: number,
    name: string,
    // external_ids: SpotifyApi.ExternalIdObject,
    // popularity: number
    // available_markets?: string[],
    // disc_number: number,
    // explicit: boolean,
    // external_urls: SpotifyApi.ExternalUrlObject,
    // href: string,
    // is_playable?: boolean,
    // linked_from?: SpotifyApi.TrackLinkObject,
    // preview_url: string,
    // track_number: number,
    // type: "track",
}

// Model to reduce SpotifyApi.AudioFeaturesObject from SpotifyApi.getAudioFeaturesForTracks()
export interface ReducedSpotifyTrackAudioFeatures {
    id: string,
    uri: string,
    acousticness: number,
    danceability: number,
    duration_ms: number,
    energy: number,
    instrumentalness: number,
    key: number,
    liveness: number,
    loudness: number,
    mode: number,
    speechiness: number,
    tempo: number,
    time_signature: number,
    valence: number
    // analysis_url: string,
    // track_href: string,
    // type: "audio_features",
}
