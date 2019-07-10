# Emotionify
Create an emotion gradiented Spotify playlist

## Current TODO
- [Bug]: Selecting different playlists before the last has loaded can cause requested data to be lost
    - This is occurring on `App.tsx:refreshPlaylist` when setting the state with the current state
- `/analysis`
    - Select a playlist like in /sort
    - Show different features about the playlist in general (from all songs)
        - 1D lines with dots representing songs for a particular feature in the playlist (do for all features)
        - Radial plots?: https://jask-oss.github.io/reaviz/?path=/story/charts-scatter-plot-radial--simple
    - Add section to home page
    - Get average point in plot for /analyse
- `/compare`
    - Compare two playlists using features similar to `/analysis`
    - Two colums on PC, row-by-row on mobile
        - To achieve this, use a grid of `1f 1f` and add playlist details by one another
- `/tools` Playlist Tools
    - Reverse a playlist
    - Randomise a playlist
    - Filter out by audio feature / name / duration
    - Add section to home page
- Home:
    - /analysis, /compare and /tools features

## To Think About
- [Static pre-renderer?](https://github.com/geelen/react-snapshot)
