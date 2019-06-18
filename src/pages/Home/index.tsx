import React from 'react';
import { navigate, useTitle } from 'hookrouter';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import SortComparisonImage from '../../img/sort-comparison.png';
import BannerImage from '../../img/banner.png';

interface IProps { }

const Home: React.FunctionComponent<IProps> = (props: IProps) => {
    useTitle('Emotionify');

    const goToSort = () => navigate('/sort');

    return <>
        <section className="jumbotron jumbotron-fluid text-center">
            <Container>
                <h1 className="sr-only">Emotionify</h1>
                <img src={BannerImage} className="mb-2" style={{ width: 800, maxWidth: '100%' }} alt="Emotionify Banner Logo" />
                <p className="lead col-md-7 mt-2 mx-auto">Easily create emotionally gradiented Spotify playlists for smoother emotional transitions in your listening</p>
            </Container>
        </section>
        
        <section>
            <Container style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2>Sort Your Playlist</h2>
                <img src={SortComparisonImage} alt="Emotionify Sort Comparison" style={{ maxWidth: '100%', width: 900 }} />
                <div style={{ maxWidth: 800, margin: '30px auto' }}>
                    <p className="lead">Using features calculated by Spotify for each song, sort your playlist on an emotional gradient.</p>
                    <p className="lead">You can also change how and what your songs are sorted by to explore different methods of sorting playlists and discover new ways to listen to your playlists.</p>
                </div>
                <Button variant="outline-dark" onClick={goToSort}>Sort My Playlist &rarr;</Button>
            </Container>
        </section>
    </>
}

export default Home;
