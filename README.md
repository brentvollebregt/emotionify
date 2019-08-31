# Emotionify
Create an emotion gradiented Spotify playlist

## Browser Support
- Edge:
    - `.flat()` is not supported; fix: `function flatMap<T>(array: T[][]): T[] { return Array.prototype.concat.apply([], array); }`
    - `finally` is not supported in Promises, `typeof (new Promise(()=>1).finally) == "undefined"`; fix: make the block a function and call it in both `.then` and `.catch` 

## To Think About
- [Static pre-renderer?](https://github.com/geelen/react-snapshot)

## References
- Bootstrap display utilities: https://getbootstrap.com/docs/4.0/utilities/display/
