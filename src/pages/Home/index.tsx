import React from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import BannerImage from '../../img/banner.png';
import { navigate, useTitle } from 'hookrouter';

interface IProps { }

const Home: React.FunctionComponent<IProps> = (props: IProps) => {
    useTitle('Emotionify');

    const goToSort = () => navigate('/sort/');

    return <>
        <section className="jumbotron jumbotron-fluid text-center">
            <Container>
                <h1 className="sr-only">Emotionify</h1>
                <img src={BannerImage} className="mb-2" style={{ width: 800, maxWidth: '100%' }} alt="Emotionify Banner Logo" />
                <p className="lead col-md-7 mt-2 mx-auto">Easily create emotionally gradiented Spotify playlists for smoother emotional transitions in your listening</p>
            </Container>
        </section>
        <section>
            <Container>
                <h2>Sort Your Playlist</h2>
                <p>Using features calculated by Spotify for each song, sort your playlist on an emotional gradient.</p>
                <p>You can also change what your songs are sorted by and how to explore different sorting methods for your playlists.</p>
                <Button onClick={goToSort}>Sort My Playlist &rarr;</Button>
            </Container>
        </section>

        {/* Testing */}
        {/* <section>
            <Container>
                <h2 className="text-center">Testing</h2>
                <Link to="/spotify-authorization"><Button>/spotify-authorization</Button></Link>
                <Button onClick={() => {localStorage.clear(); window.location.reload(true);}}>Clean and refresh</Button>
            </Container>
        </section> */}
    </>
}

export default Home;
