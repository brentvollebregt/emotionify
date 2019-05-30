import React from 'react';
import { Redirect } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import banner from '../../img/banner.png'


interface HomeProps  { }

const Home: React.SFC<HomeProps> = (props: HomeProps) => {
    return <section className="jumbotron jumbotron-fluid text-center header">
        <Container>
            <img src={banner} className="mb-2" style={{width: 800, maxWidth: '100%'}} />
            <p className="lead col-md-7 mt-2 mx-auto">Easily create emotionally gradiented Spotify playlists for smoother emotional transitions in your listening</p>
        </Container>
    </section>
}

Home.defaultProps = {
    currentToken: null,
    onTokenChanged: () => {},
}

export default Home;