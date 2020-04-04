import React, { useState, useEffect } from "react";
import { useRoutes, useRedirect } from "hookrouter";
import SpotifyWebApi from "spotify-web-api-js";
import cogoToast from "cogo-toast";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import TokenRefreshWarning from "./components/TokenRefreshWarning";
import StoredDataDialog from "./components/StoredDataDialog";
import MetaTags from "./components/MetaTags";
import SpotifyAuthorization from "./pages/SpotifyAuthorization";
import Home from "./pages/Home";
import Sort from "./pages/Sort";
import Compare from "./pages/Compare";
import Tools from "./pages/Tools";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import useNavigatorOnline from "./hooks/NavigatorOnline";
import useScrollToTopOnRouteChange from "./hooks/ScrollToTopOnRouteChange";
import {
  Token,
  SpotifyData,
  PlaylistObjectSimplifiedWithTrackIds,
  TrackWithAudioFeatures
} from "./models/Spotify";
import {
  getAllSpotifyUsersPlaylists,
  getAllTracksInPlaylist,
  getAudioFeaturesForTracks
} from "./logic/Spotify";
import { arrayToObject } from "./logic/Utils";

const localStorageKey = "emotionify-app";
const storageVersion = 1;

const emptySpotifyData = {
  user: undefined,
  playlists: {},
  tracks: {},
  audioFeatures: {}
};

interface IStorage {
  version: number;
  token: Token;
  user: SpotifyApi.UserObjectPrivate | undefined;
  playlists: { [key: string]: PlaylistObjectSimplifiedWithTrackIds };
}

export const App: React.FunctionComponent = () => {
  const [token, setToken] = useState<Token | undefined>(undefined);
  const [spotifyData, setSpotifyData] = useState<SpotifyData>(emptySpotifyData);
  const [storedDataDialogOpen, setStoredDataDialogOpen] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState<Set<string>>(new Set());
  const isOnline = useNavigatorOnline();
  useScrollToTopOnRouteChange();

  const onTokenChange = (newToken: Token | undefined) => setToken(newToken);
  const onLogOut = () => onTokenChange(undefined);
  const openStoredDataDialog = () => setStoredDataDialogOpen(true);
  const closeStoredDataDialog = () => setStoredDataDialogOpen(false);

  const refreshUsersPlaylists = (hard: boolean = true) => {
    if (token !== undefined && spotifyData.user !== undefined) {
      getAllSpotifyUsersPlaylists(token, spotifyData.user)
        .then((playlists) => {
          // Remove all requested playlist track ids if we are refreshing hard
          setSpotifyData((prevState) => ({
            ...prevState,
            playlists: {
              ...arrayToObject<PlaylistObjectSimplifiedWithTrackIds>(
                playlists.map((p) =>
                  p.id in prevState.playlists && !hard
                    ? { ...p, track_ids: prevState.playlists[p.id].track_ids }
                    : p
                ),
                "id"
              )
            }
          }));
        })
        .catch((err) =>
          cogoToast.error(
            "Could not get your playlists. Make sure you are connected to the internet and that your token is valid.",
            {
              position: "bottom-center",
              heading: "Error When Fetching Playlists",
              hideAfter: 20,
              onClick: (hide: any) => hide()
            }
          )
        );
    }
  };

  const refreshPlaylist = (playlist: SpotifyApi.PlaylistObjectSimplified) => {
    if (token !== undefined && !playlistsLoading.has(playlist.id)) {
      setPlaylistsLoading((prevState) => new Set([...Array.from(prevState), playlist.id]));
      getAllTracksInPlaylist(token, playlist)
        .then((tracks) => {
          setSpotifyData((prevState) => {
            const tracks_with_data = tracks.filter((t) => Object.values(t).length !== 1); // Filter out tracks that don't have data (can happen with vidoes - will only be {audio_features: undefined})
            if (tracks.length !== tracks_with_data.length) {
              cogoToast.warn(
                `Could not get data for ${tracks.length - tracks_with_data.length} song(s) from "${
                  playlist.name
                }". These are most likely videos in the playlist which are not supported.`,
                {
                  position: "bottom-center",
                  heading: "Possible Missing Songs",
                  hideAfter: 20,
                  onClick: (hide: any) => hide()
                }
              );
            }
            const new_tracks = tracks_with_data.filter((t) => !(t.id in prevState.tracks));
            return {
              ...prevState,
              tracks: {
                ...prevState.tracks,
                ...arrayToObject<TrackWithAudioFeatures>(new_tracks, "id")
              },
              playlists: {
                ...prevState.playlists,
                [playlist.id]: {
                  ...prevState.playlists[playlist.id],
                  track_ids: tracks.map((t) => t.id)
                }
              }
            };
          });
        })
        .catch((err) =>
          cogoToast.error(
            `Could not get songs for the playlist "${playlist.name}". Make sure you are connected to the internet and that your token is valid.`,
            {
              position: "bottom-center",
              heading: "Error When Fetching Playlist's Songs",
              hideAfter: 20,
              onClick: (hide: any) => hide()
            }
          )
        )
        .finally(() =>
          setPlaylistsLoading((prevState) => {
            const updatedPlaylistsLoading = new Set(prevState);
            updatedPlaylistsLoading.delete(playlist.id);
            return updatedPlaylistsLoading;
          })
        );
    }
  };

  useEffect(() => {
    // Retrieve part of state from localStorage on startup
    let stored_data: string | null = localStorage.getItem(localStorageKey);
    if (stored_data !== null) {
      try {
        const stored_data_parsed: IStorage = JSON.parse(stored_data);
        stored_data_parsed.token.expiry = new Date(stored_data_parsed.token.expiry);
        if (
          stored_data_parsed.version === storageVersion &&
          stored_data_parsed.token.expiry > new Date()
        ) {
          setToken(stored_data_parsed.token);
          setSpotifyData({
            ...emptySpotifyData,
            user: stored_data_parsed.user,
            playlists: stored_data_parsed.playlists
          });
          refreshUsersPlaylists();
        }
      } catch (error) {
        console.error("Failed to read state from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    // Store part of state in localStorage
    if (token !== undefined) {
      let data_to_store: IStorage = {
        version: storageVersion,
        token: token,
        user: spotifyData.user,
        playlists: arrayToObject<PlaylistObjectSimplifiedWithTrackIds>(
          Object.values(spotifyData.playlists).map((p) => {
            return { ...p, track_ids: [] };
          }),
          "id"
        ) // Empty track_id lists in playlist objects
      };
      localStorage.setItem(localStorageKey, JSON.stringify(data_to_store));
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }, [token, spotifyData.user, spotifyData.playlists]);

  useEffect(() => {
    // Request the user when the token changes
    if (token === undefined) {
      setSpotifyData((prevState) => ({ ...prevState, user: undefined }));
    } else {
      const spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(token.value);
      spotifyApi
        .getMe()
        .then((user) => {
          if (spotifyData.user === undefined) {
            // If there is currently no user, clear the playlists and put the new user in
            setSpotifyData((prevState) => ({ ...prevState, playlists: {}, user: user }));
          } else if (spotifyData.user.id !== user.id) {
            // If this is a new user
            setSpotifyData((prevState) => ({ ...prevState, playlists: {}, user: user }));
          } else {
            // Same user, new token
            setSpotifyData((prevState) => ({ ...prevState, user: user }));
          }
        })
        .catch((err) =>
          cogoToast.error(
            "Could not get your profile. Make sure you are connected to the internet and that your token is valid.",
            {
              position: "bottom-center",
              heading: "Error When Fetching Your Profile",
              hideAfter: 20,
              onClick: (hide: any) => hide()
            }
          )
        );
    }
  }, [token]);

  useEffect(() => {
    // Request playlists on user change
    if (spotifyData.user === undefined) {
      setSpotifyData((prevState) => ({ ...prevState, playlists: {} }));
    } else {
      refreshUsersPlaylists();
    }
  }, [spotifyData.user]);

  useEffect(() => {
    // Request audio features when needed
    const track_ids_with_no_audio_features: string[] = Object.values(spotifyData.tracks)
      .filter((t) => t.audio_features === undefined)
      .map((t) => t.id);

    if (token !== undefined && track_ids_with_no_audio_features.length > 0) {
      getAudioFeaturesForTracks(token, track_ids_with_no_audio_features)
        .then((audio_features: (SpotifyApi.AudioFeaturesObject | null)[]) => {
          // Some tracks will return null audio features
          // Check if any tracks do not have audio features
          const audio_features_by_track_id = arrayToObject<SpotifyApi.AudioFeaturesObject>(
            audio_features.filter((af): af is SpotifyApi.AudioFeaturesObject => af !== null),
            "id"
          );
          const tracks_with_new_audio_features: TrackWithAudioFeatures[] = track_ids_with_no_audio_features.map(
            (tid) => ({
              ...spotifyData.tracks[tid],
              audio_features:
                tid in audio_features_by_track_id ? audio_features_by_track_id[tid] : null
            })
          );

          // Show a warning if there were tracks with no audio features
          const null_audio_feature_tracks = tracks_with_new_audio_features.filter(
            (t) => t.audio_features === null
          );
          if (null_audio_feature_tracks.length > 0) {
            console.warn(
              `Some audio features are null: ${null_audio_feature_tracks
                .map((t) => t.id)
                .join(", ")}`
            );
          }

          setSpotifyData((prevState) => ({
            ...prevState,
            tracks: {
              ...prevState.tracks,
              ...arrayToObject<TrackWithAudioFeatures>(tracks_with_new_audio_features, "id")
            }
          }));
        })
        .catch((err) =>
          cogoToast.error(
            "Could not get audio features for some songs. Make sure you are connected to the internet and that your token is valid.",
            {
              position: "bottom-center",
              heading: "Error When Fetching Song Audio Features",
              hideAfter: 20,
              onClick: (hide: any) => hide()
            }
          )
        );
    }
  }, [spotifyData.tracks]);

  useEffect(() => {
    // Display a warning when offline
    if (!isOnline) {
      cogoToast.warn(
        "You are now offline. You will not be able to request data from Spotify unless you are connected to the internet.",
        {
          position: "bottom-center",
          heading: "Offline",
          hideAfter: 10,
          onClick: (hide: any) => hide()
        }
      );
    }
  }, [isOnline]);

  const routes = {
    "/": () => (
      <MetaTags
        route="/"
        description="Easily create emotionally gradiented Spotify playlists for smoother emotional transitions in your listening."
      >
        <Home />
      </MetaTags>
    ),
    "/spotify-authorization": () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
    "/spotify-authorization/": () => <SpotifyAuthorization onTokenChange={onTokenChange} />,
    "/sort": () => (
      <MetaTags
        route="/sort"
        titlePrefix="Sort - "
        description="Select one of your Spotify playlists and look at how the new playlist is sorted. You can then create the new playlist or select a different playlist."
      >
        <Sort
          token={token}
          user={spotifyData.user}
          playlists={spotifyData.playlists}
          tracks={spotifyData.tracks}
          playlistsLoading={playlistsLoading}
          refreshPlaylist={refreshPlaylist}
          refreshUsersPlaylists={refreshUsersPlaylists}
        />
      </MetaTags>
    ),
    "/compare": () => (
      <MetaTags
        route="/compare"
        titlePrefix="Compare - "
        description="Select playlists and compare them on one audio feature, two audio features or seven pre-selected audio features."
      >
        <Compare
          user={spotifyData.user}
          playlists={spotifyData.playlists}
          tracks={spotifyData.tracks}
          playlistsLoading={playlistsLoading}
          refreshPlaylist={refreshPlaylist}
        />
      </MetaTags>
    ),
    "/tools": () => (
      <MetaTags
        route="/tools"
        titlePrefix="Tools - "
        description="Apply filters and functions to your Spotify playlists to order then in a way you want."
      >
        <Tools
          token={token}
          user={spotifyData.user}
          playlists={spotifyData.playlists}
          tracks={spotifyData.tracks}
          playlistsLoading={playlistsLoading}
          refreshPlaylist={refreshPlaylist}
          refreshUsersPlaylists={refreshUsersPlaylists}
        />
      </MetaTags>
    ),
    "/about": () => (
      <MetaTags
        route="/about"
        titlePrefix="About - "
        description="Emotionfy is a webapp that helps you look at your Spotify playlists and the pre-calculated audio features of each song in playlists to plot them on an emotional pane. The app also provides other tools for manipulating playlists using these features. "
      >
        <About />
      </MetaTags>
    )
  };
  const routeResult = useRoutes(routes);
  useRedirect("/sort/", "/sort");
  useRedirect("/compare/", "/compare");
  useRedirect("/about/", "/about");

  return (
    <>
      <TokenRefreshWarning token={token} onLogOut={onLogOut} />
      {token !== undefined && spotifyData.user !== undefined && storedDataDialogOpen && (
        <StoredDataDialog
          token={token}
          user={spotifyData.user}
          playlists={spotifyData.playlists}
          tracks={spotifyData.tracks}
          onClose={closeStoredDataDialog}
          onLogOut={onLogOut}
        />
      )}
      <Navigation user={spotifyData.user} onAuthButtonLoggedInClick={openStoredDataDialog} />
      {routeResult || <NotFound />}
      <Footer />
    </>
  );
};

export default App;
