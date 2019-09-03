<div style="text-align: center">
    <a href="https://emotionify.nitratine.net/"><img src="https://nitratine.net/post-assets/emotionify/emotionify-banner.png" alt="Emotionify Banner" style="background: white;"></a>
</div>
<p align="center">Create emotionally gradiented Spotify playlists and more.</p>
<p align="center"><a href="https://emotionify.nitratine.net/">🌐: emotionify.nitratine.net</a></p>


## 🛠️ Setup
- Clone the repo
- Execute `npm install`
- Execute `npm start`

> After following these steps, a new browser tab will open with the locally hosted application in development mode.

## 📝 Features
- **Spotify authorization for library access**
- **Sort a playlist by valence and energy**
	- Sorting on these two values can create a transition from sadder/slower songs to more happy/energetic songs.
	- Can change the sorting audio features and sorting method
	- Exports to a new playlist
- **Compare playlists**
	- Compare multiple playlists in 1D, 2D or 7D from selected audio features.
- **Playlist tools**
	- Add playlists and apply filters and functions to playlists to manipulate song ordering
	- Exports to a new playlist

> All [audio features]([https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/](https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/)) used are pre-computed by Spotify and obtained through their API.

## ❓ Why?
Emotionify is an application I had thought about for a few years after doing a project at university on attempting to detect emotion in music and portraying it in an interactive environment.

I was curious how the method implemented would play out with music I listen to every day and wanted some extra tools for Spotify playlists.

Emotionify is not 100% accurate as emotion is highly opinion based and the values used to sort songs are averages over the whole song. This tool however does give insight on how well a computer can plot an emotional gradient with a list of songs.


## 🚧 TODO
- [Static pre-renderer?](https://github.com/geelen/react-snapshot)
