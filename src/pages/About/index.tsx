import React from 'react';
import Container from 'react-bootstrap/Container';
import { useTitle } from 'hookrouter';

interface IProps { }

const About: React.FunctionComponent<IProps> = (props: IProps) => {
    useTitle('Emotionify - About');

    return <Container className="text-center">
        <h1>About</h1>
        <p>Emotionify is ...</p>
        <p>Emotionify is not ... 100% accurate</p>

        <h2>FAQ</h2>
        <h5>Why is this a thing?</h5>
        <p>Because I wanted it to be.</p>
        <h5>Will this remove duplicates?</h5>
        <p>Yes, if we didn't then the duplicate songs would be bunched up by each other. Removing these allows for proper transitions into a different song.</p>
        <h5>How do I clear all my data?</h5>
        <p>All data is stored in localStorage on your machine; simply logging out will clear all this data.</p>
    </Container>
}

export default About;
