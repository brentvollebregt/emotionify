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
    audio_features: SpotifyApi.AudioFeaturesObject | undefined
}

export const availableTrackAudioFeatures: {[key: string]: string} = {
    'Acousticness': 'acousticness',
    'Danceability': 'danceability',
    'Duration': 'duration_ms',
    'Energy': 'energy',
    'Instrumentalness': 'instrumentalness',
    'Key': 'key',
    'Liveness': 'liveness',
    'Loudness': 'loudness',
    'Mode': 'mode',
    'Speechiness': 'speechiness',
    'Tempo': 'tempo',
    'Time Signature' : 'time_signature',
    'Valence': 'valence'
};
