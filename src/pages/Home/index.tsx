import React from 'react';
import { navigate, useTitle } from 'hookrouter';
import { Button, Container } from 'react-bootstrap';
import BannerImage from '../../img/banner.png';
import SortPageDemoImage from '../../img/sort-page-demo.png';
import ComparePageDemoImage from '../../img/compare-page-demo.png';
import ToolsPageDemoImage from '../../img/tools-page-demo.png';

interface IProps { }

const Home: React.FunctionComponent<IProps> = (props: IProps) => {
    useTitle('Emotionify');

    const goTo = (location: string) => () => navigate(location);

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
                <img src={SortPageDemoImage} alt="Emotionify Sort Comparison" style={{ maxWidth: '100%', width: 900 }} />
                <div style={{ maxWidth: 800, margin: '30px auto' }}>
                    <p className="lead">Using features calculated by Spotify for each song, sort your playlist on an emotional gradient.</p>
                    <p className="lead">You can also change how and what your songs are sorted by to explore different methods of sorting playlists and discover new ways to listen to your playlists.</p>
                </div>
                <Button variant="outline-secondary" onClick={goTo('/sort')}>Sort My Playlist &rarr;</Button>
            </Container>
        </section>

        <section>
            <Container style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2>Compare Playlists</h2>
                <img src={ComparePageDemoImage} alt="Playlist Box Plot Comparison" style={{ maxWidth: '100%', width: 810 }} />
                <div style={{ maxWidth: 800, margin: '30px auto' }}>
                    <p className="lead">Compare your playlists based off audio features calculated by Spotify.</p>
                    <p className="lead">Select any number of playlists and compare them in one or two dimensions for any audio feature or seven dimensions for specific audio features.</p>
                </div>
                <Button variant="outline-secondary" onClick={goTo('/compare')}>Compare My Playlists &rarr;</Button>
            </Container>
        </section>

        <section>
            <Container style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2>Playlist Tools</h2>
                <img src={ToolsPageDemoImage} alt="Playlist Tools" style={{ maxWidth: '100%', width: 680 }} />
                <div style={{ maxWidth: 800, margin: '30px auto' }}>
                    <p className="lead">Merge, filter and sort your playlists to make a more focused playlist.</p>
                    <p className="lead">Select playlists, filter and sort by audio features and even randomise your playlists to make a playlist focused for any occasion.</p>
                </div>
                <Button variant="outline-secondary" onClick={goTo('/tools')}>Create My New Playlist &rarr;</Button>
            </Container>
        </section>
    </>
}

export default Home;
