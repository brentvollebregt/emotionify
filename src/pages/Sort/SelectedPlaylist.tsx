import React from 'react';
import Badge from 'react-bootstrap/Badge';

interface SelectedPlaylistProps {
    playlist: SpotifyApi.PlaylistObjectSimplified
}

const SelectedPlaylist: React.SFC<SelectedPlaylistProps> = (props: SelectedPlaylistProps) => {
    const { playlist } = props;
    return <>
        <h3 className="mt-4 mb-0">{playlist.name}</h3>
        <div>
            <a href={playlist.owner.href}><Badge variant="primary">{playlist.owner.display_name}</Badge></a>
            <Badge variant="dark" className="ml-1">Tracks: {playlist.tracks.total}</Badge>
            <a href={playlist.external_urls.spotify} className="ml-1"><Badge variant="success">Spotify</Badge></a>
            <Badge variant="danger" className="ml-1">{playlist.public ? 'Public' : 'Private'}</Badge>
        </div>
    </>
}

export default SelectedPlaylist;