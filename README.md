<div style="text-align: center">
    <a href="https://emotionify.nitratine.net/">
			<img src="https://nitratine.net/posts/emotionify/emotionify-banner.png" alt="Emotionify Banner" style="background: white;">
		</a>
</div>
<p align="center">Create emotionally gradiented Spotify playlists and more.</p>
<p align="center"><a href="https://emotionify.nitratine.net/">🌐: emotionify.nitratine.net</a></p>

## 🧪 Development Setup

1. Clone the repo
2. Execute `npm install`
3. Create a new app / client id at [developer.spotify.com](https://developer.spotify.com/dashboard/applications).
4. Copy your client id into `/src/config.ts`.
5. Click "Edit Settings" in the newly created Spotify developer app and add a redirect URI to where `/spotify-authorization` will be hosted - by default this will be `https://localhost:3000/spotify-authorization`
6. Set `HTTPS=true` (HTTPS is required to use `window.crypto`)
   - In PowerShell: `$env:HTTPS = "true"`
7. Set `NODE_OPTIONS=--openssl-legacy-provider` (react-scripts doesn't play nice with newer versions of Node)
   - In PowerShell: ` $env:NODE_OPTIONS = "--openssl-legacy-provider"`
8. Execute `npm start`
9. Accept the SSL warning

## 📷 Snippets From the Web App

Example Sort Visualisation of a Personal Playlist
![Example Sort Visualisation of a Personal Playlist](https://nitratine.net/posts/emotionify/emotionify-sort-comparison.png)

Example Comparison Visualisation of a Personal Playlists
![Example Comparison Visualisation of a Personal Playlists](https://nitratine.net/posts/emotionify/emotionify-compare-box-plot.png)

Example of Applying Filters to Playlists
![Example of Applying Filters to Playlists](https://nitratine.net/posts/emotionify/emotionifytools-page-demo.png)

## 📝 Features

- **Spotify authorization for library access**
- **Sort a playlist by valence and energy** - Sorting on these two values can create a transition from sadder/slower songs to more happy/energetic songs. - Can change the sorting audio features and sorting method - Exports to a new playlist
- **Compare playlists** - Compare multiple playlists in 1D, 2D or 7D from selected audio features.
- **Playlist tools** - Add playlists and apply filters and functions to playlists to manipulate song ordering - Exports to a new playlist

> All [audio features](https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/) used are pre-computed by Spotify and obtained through their API.

## ❓ Why?

Emotionify is an application I had thought about for a few years after doing a project at university on attempting to detect emotion in music and portraying it in an interactive environment.

I was curious how the method implemented would play out with music I listen to every day and wanted some extra tools for Spotify playlists.

Emotionify is not 100% accurate as emotion is highly opinion based and the values used to sort songs are averages over the whole song. This tool however does give insight on how well a computer can plot an emotional gradient with a list of songs.
