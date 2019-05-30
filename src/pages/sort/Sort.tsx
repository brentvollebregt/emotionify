import React from 'react';
import { Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

interface IProps {
    token: {
        value: string | null,
        expiry: Date
    }
}

interface IState {

}

class Sort extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = {

        }
    }

    render() {
        const { value, expiry } = this.props.token;

        const header = <Container className="mb-4">
            <h1 className="text-center">Playlist Sort</h1>
            <p className="text-center lead col-md-7 mx-auto">Here you can select a playlist and look at how the new playlist is sorted. You can then create the new playlist or select a different playlist.</p>
        </Container>;

        // Check if token exists
        if (value === null) {
            return (
                <>
                    { header }
                    <Container className="text-center">
                        <h2>Login to Spotify</h2>
                        <p>To get access to your playlists and the ability to create playlists, you need to sign into Spotify.</p>
                        <Link to="/spotify-authorization"><Button>Sign Into Spotify</Button></Link>
                    </Container>
                </>
            )
        }

        // Check if token hasn't expired
        if (expiry < new Date()) {
            return (
                <>
                    { header }
                    <Container className="text-center">
                        <h2 className="text-center">Login to Spotify</h2>
                        <p className="text-center">A previously stored token has now expired; these tokens last for an hour. Please sign back into Spotify to get a new token and continue with sorting playlists.</p>
                        <Link to="/spotify-authorization"><Button>Sign Into Spotify</Button></Link>
                    </Container>
                </>
            )
        }

        return (
            <>
                { header }
                <Container>
                    <h2 className="text-center">Select a Playlist</h2>
                    <p className="text-center">Select a playlist to sort</p>
                </Container>
            </>
        )
    }
}

export default Sort;
