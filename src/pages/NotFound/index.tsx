import React from 'react';
import { navigate, useTitle } from 'hookrouter';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

interface IProps { }

const NotFound: React.FunctionComponent<IProps> = (props: IProps) => {
    useTitle('Emotionify - Page Not Found');

    const navigateHome = () => navigate('/');

    return <Container className="text-center">
        <h1 className="my-4">Page Not Found</h1>
        <Button onClick={navigateHome}>Go Home &rarr;</Button>
    </Container>;
}

export default NotFound;
