export interface SpotifyData {
  user: SpotifyApi.UserObjectPrivate | undefined;
  playlists: {
    [key: string]: PlaylistObjectSimplifiedWithTrackIds;
  };
  tracks: {
    [key: string]: TrackWithAudioFeatures;
  };
}

export interface Token {
  value: string;
  expiry: Date;
}

export interface PlaylistObjectSimplifiedWithTrackIds extends SpotifyApi.PlaylistObjectSimplified {
  track_ids: string[];
}

export interface TrackWithAudioFeatures extends SpotifyApi.TrackObjectFull {
  audio_features: SpotifyApi.AudioFeaturesObject | null | undefined; // undefined when none have been requested, null when they don't exist (after requesting)
}

export interface AudioFeatureProperty {
  key: keyof SpotifyApi.AudioFeaturesObject;
  min: number | undefined;
  max: number | undefined;
  show_in_sort: boolean;
  show_in_compare_radar: boolean;
}

export const availableTrackAudioFeatures: { [key: string]: AudioFeatureProperty } = {
  Acousticness: {
    key: "acousticness",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  },
  Danceability: {
    key: "danceability",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  },
  Duration: {
    key: "duration_ms",
    min: 0,
    max: undefined,
    show_in_sort: true,
    show_in_compare_radar: false
  },
  Energy: {
    key: "energy",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  },
  Instrumentalness: {
    key: "instrumentalness",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  },
  Key: {
    key: "key",
    min: undefined,
    max: undefined,
    show_in_sort: false,
    show_in_compare_radar: false
  },
  Liveness: {
    key: "liveness",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  },
  Loudness: {
    key: "loudness",
    min: undefined,
    max: 0,
    show_in_sort: true,
    show_in_compare_radar: false
  },
  Mode: {
    key: "mode",
    min: 0,
    max: 1,
    show_in_sort: false,
    show_in_compare_radar: false
  },
  Speechiness: {
    key: "speechiness",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  },
  Tempo: {
    key: "tempo",
    min: undefined,
    max: undefined,
    show_in_sort: true,
    show_in_compare_radar: false
  },
  "Time Signature": {
    key: "time_signature",
    min: 0,
    max: undefined,
    show_in_sort: false,
    show_in_compare_radar: false
  },
  Valence: {
    key: "valence",
    min: 0,
    max: 1,
    show_in_sort: true,
    show_in_compare_radar: true
  }
};
