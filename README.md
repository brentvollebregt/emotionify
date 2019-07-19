# Emotionify
Create an emotion gradiented Spotify playlist

## Current TODO
- `/analyse`
    - Select a playlist like in /sort
    - Show different features about the playlist in general (from all songs)
        - 1D lines with dots representing songs for a particular feature in the playlist (do for all features)
        - Radial plots?: https://jask-oss.github.io/reaviz/?path=/story/charts-scatter-plot-radial--simple
    - Add section to home page
    - Get average point in plot
    - Show duplicated songs
- `/tools` Playlist Tools
    - Reverse a playlist
    - Randomise a playlist
    - Filter out by audio feature / name / duration
        - Show a view of the songs in the playlist with ones that are kept still coloured and ones being removed as grey
    - Add section to home page
- `/compare`
    - Compare two playlists using features similar to `/analysis`
    - Two colums on PC, row-by-row on mobile
        - To achieve this, use a grid of `1f 1f` and add playlist details by one another
	- Light orange and light blue
- Home:
    - /analysis, /compare and /tools features

## Browser Support
- Edge:
    - `.flat()` is not supported; fix: `function flatMap<T>(array: T[][]): T[] { return Array.prototype.concat.apply([], array); }`
    - `finally` is not supported in Promises, `typeof (new Promise(()=>1).finally) == "undefined"`; fix: make the block a function and call it in both `.then` and `.catch` 

## To Think About
- [Static pre-renderer?](https://github.com/geelen/react-snapshot)
