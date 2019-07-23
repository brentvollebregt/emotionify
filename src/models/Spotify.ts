export interface SpotifyData {
    user: SpotifyApi.UserObjectPrivate | undefined,
    playlists: {
        [key: string]: PlaylistObjectSimplifiedWithTrackIds
    },
    tracks: {
        [key: string]: TrackWithAudioFeatures
    }
}

export interface Token {
    value: string,
    expiry: Date
}

export interface PlaylistObjectSimplifiedWithTrackIds extends SpotifyApi.PlaylistObjectSimplified {
    track_ids: string[]
}

export interface TrackWithAudioFeatures extends SpotifyApi.TrackObjectFull {
    audio_features: SpotifyApi.AudioFeaturesObject | null | undefined // undefined when none have been requested, null when they don't exist (after requesting)
}

export interface AudioFeatureProperty {
    key: string,
    min: number | undefined,
    max: number | undefined,
    show_in_sort: boolean
}

export const availableTrackAudioFeatures: {[key: string]: AudioFeatureProperty} = {
    'Acousticness': {
        key: 'acousticness',
        min: 0,
        max: 1,
        show_in_sort: true
    },
    'Danceability': {
        key: 'danceability',
        min: 0,
        max: 1,
        show_in_sort: true
    },
    'Duration': {
        key: 'duration_ms',
        min: 0,
        max: undefined,
        show_in_sort: true
    },
    'Energy': {
        key: 'energy',
        min: 0,
        max: 1,
        show_in_sort: true
    },
    'Instrumentalness': {
        key: 'instrumentalness',
        min: 0,
        max: 1,
        show_in_sort: true
    },
    'Key': {
        key: 'key',
        min: undefined,
        max: undefined,
        show_in_sort: false
    },
    'Liveness': {
        key: 'liveness',
        min: 0,
        max: 1,
        show_in_sort: true
    },
    'Loudness': {
        key: 'loudness',
        min: -60,
        max: 0,
        show_in_sort: true
    },
    'Mode': {
        key: 'mode',
        min: 0,
        max: 1,
        show_in_sort: false
    },
    'Speechiness': {
        key: 'speechiness',
        min: 0,
        max: 1,
        show_in_sort: true
    },
    'Tempo': {
        key: 'tempo',
        min: undefined,
        max: undefined,
        show_in_sort: true
    },
    'Time Signature': {
        key: 'time_signature',
        min: 0,
        max: undefined,
        show_in_sort: false
    },
    'Valence': {
        key: 'valence',
        min: 0,
        max: 1,
        show_in_sort: true
    },
};
