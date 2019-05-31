import React from 'react';
import Container from 'react-bootstrap/Container';

interface AboutProps { }

const About: React.SFC<AboutProps> = (props: AboutProps) => {
    return <Container className="text-center">
        <h1>About</h1>
        <p>Emotionify is ...</p>
        <p>Emotionify is not ... 100% accurate</p>

        <h2>FAQ</h2>
        <h5>Why is this a thing?</h5>
        <p>Because I wanted it to be.</p>
    </Container>
}

About.defaultProps = {}

export default About;