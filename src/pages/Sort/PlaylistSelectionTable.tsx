import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { PlaylistObjectSimplifiedWithTrackIds } from '../../models/Spotify';
import useWindowSize from '../../hooks/WindowSize';

interface IProps {
    playlists: PlaylistObjectSimplifiedWithTrackIds[],
    selectedPlaylist: string | undefined,
    onPlaylistSelected: (id: string) => void
}

const selectedBackground = 'linear-gradient(to right, rgba(0, 82, 157, 0.3), rgba(235, 18, 27, 0.3))';

const PlaylistSelection: React.FunctionComponent<IProps> = (props: IProps) => {
    const {playlists, selectedPlaylist, onPlaylistSelected} = props;

    const [search, setSearch] = useState('');
    const windowSize = useWindowSize();

    const onComponentPlaylistSelected = (playlist_id: string) => () => onPlaylistSelected(playlist_id);
    const onSearchChange = (event: React.FormEvent<any>) => setSearch(event.currentTarget.value);

    const filteredPlaylists = playlists.filter(p => p.name.indexOf(search) !== -1 || p.uri.indexOf(search) !== -1);
    const sortedPlaylists = filteredPlaylists.sort((a: PlaylistObjectSimplifiedWithTrackIds, b: PlaylistObjectSimplifiedWithTrackIds) => a.name === b.name ? 0 : a.name > b.name ? 1 : -1);

    const bootstrapBreakpointBiggerThanSm = () => windowSize.innerWidth > 576; // Bootstrap >sm in js

    return <>
        <h3 className="mb-3">Select a Playlist</h3>
        <div style={{ width: 700, maxWidth: '100%', margin: 'auto' }}>
            <InputGroup style={{ marginBottom: 5 }}>
                <InputGroup.Prepend>
                    <InputGroup.Text>{bootstrapBreakpointBiggerThanSm() ? 'Search Playlists': 'Search'}</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl placeholder="Playlist name..." value={search} onChange={onSearchChange} />
            </InputGroup>

            <div style={{ maxHeight: 450, overflowX: 'auto' }}>
                <Table striped hover>
                    <tbody>
                        {sortedPlaylists.map(playlist => 
                            <tr 
                                key={playlist.id} 
                                onClick={onComponentPlaylistSelected(playlist.id)} 
                                style={{ cursor: 'pointer', background: selectedPlaylist === playlist.id ? selectedBackground : undefined, display: 'grid', gridTemplateColumns: '60px 1fr' }}
                            >
                                <td style={{ padding: 2 }}>
                                    {playlist.images.length > 0 && <img src={playlist.images[0].url} style={{ width: '100%' }} alt={'Artwork for: ' + playlist.name}/>}
                                </td>
                                <td style={{ textAlign: 'left', padding: '0 0 0 10px' }}>
                                    <div style={{ fontSize: 22 }}>{playlist.name}</div>
                                    <div>
                                        <Badge variant="primary">{playlist.owner.display_name}</Badge>
                                        <Badge variant="dark" className="ml-1">Songs: {playlist.tracks.total}</Badge>
                                        <Badge variant="danger" className="ml-1">{playlist.public ? 'Public' : 'Private'}</Badge>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    </>
}

export default PlaylistSelection;
