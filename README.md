# Emotionify
Create an emotion gradiented Spotify playlist

## Simple Idea
- Login
- Select a playlist
- Display plot data with buttons to switch between current points connected and proposed
- Export to playlist
    - Create a new playlist that they can name

## Pages
> Keep it simple

- Home
    - Explain what the project is
    - Make it look cool?
    - Practically a landing page
- Sort
    - Check the user is logged in
    - Select a playlist
    - Plot points on a x y scatter plot
        - Hovering points shows the song
    - Below plot, show contents off playlist
    - When the user clicks the sort button, sort the playlist locally
    - Allow for export
- Analysis
    - Check the user is logged in
    - Show different features about the playlist in general (from all songs)
    - Visuals
        - Could have 1D lines with dots representing songs for a particular feature in the playlist
- About
    - Why I made the project
    - Similar work

## Do Not Forget
- Need some way to logout of spotify

## Advanced Dropdown
When the songs are plotted, eventually I could add some advanced features
- Change x and y (from other data provided). This can then sort the playlist differently.
- Cut it down to a specific time (randomly remove)

## Tech
- React (TypeScript)
- [Spotify API](https://www.npmjs.com/package/spotify-web-api-js)
- [Bootstrap](https://react-bootstrap.github.io/)
- [React D3](https://react-d3-library.github.io/)
    - Want something lile [this](https://www.d3-graph-gallery.com/graph/connectedscatter_basic.html)
