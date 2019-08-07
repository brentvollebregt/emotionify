# Emotionify
Create an emotion gradiented Spotify playlist

## Current TODO
- `/tools` Playlist Tools
    - Add action by action down the page
    - Reverse a playlist
    - Randomise a playlist
    - Filter out by audio feature / name / duration
        - Show a view of the songs in the playlist with ones that are kept still coloured and ones being removed as grey
    - Add section to home page
- Home page for `/tools`

## Browser Support
- Edge:
    - `.flat()` is not supported; fix: `function flatMap<T>(array: T[][]): T[] { return Array.prototype.concat.apply([], array); }`
    - `finally` is not supported in Promises, `typeof (new Promise(()=>1).finally) == "undefined"`; fix: make the block a function and call it in both `.then` and `.catch` 

## To Think About
- [Static pre-renderer?](https://github.com/geelen/react-snapshot)

## References
- Bootstrap display utilities: https://getbootstrap.com/docs/4.0/utilities/display/
