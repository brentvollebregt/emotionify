import React from 'react';
import { useTitle } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import SpotifyLoginStatusButton from '../../components/SpotifyLoginStatusButton';

interface IProps {
    user: SpotifyApi.UserObjectPrivate | undefined,
}

const Tools: React.FunctionComponent<IProps> = (props: IProps) => {
    const { user } = props;

    useTitle('Emotionify - Tools');

    const header = <Container className="mt-3 mb-4">
        <h1 className="text-center">Playlist Tools</h1>
        <p className="text-center lead col-md-7 mx-auto">Apply filters and functions to manipulate your playlists.</p>
    </Container>;

    if (user === undefined) {
        return <>
            {header}
            <Container className="text-center">
                <h2>Sign into Spotify</h2>
                <p>To get access to your playlists and the ability to create playlists, you need to sign into Spotify.</p>
                <SpotifyLoginStatusButton user={user} />
            </Container>
        </>
    }

    return <Container>
        {header}
    </Container>
}

export default Tools;
