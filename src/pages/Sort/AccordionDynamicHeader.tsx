import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { randomString } from '../../logic/Utils';

interface IProps {
    contractedHeader: string,
    expandedHeader: string,
    children: React.ReactNode,
    initiallyExpanded: boolean
}

export const AccordionDynamicHeader: React.FunctionComponent<IProps> = (props: IProps) => {
    const { contractedHeader, expandedHeader, children, initiallyExpanded } = props;

    const [randomEventKey, setRandomEventKey] = useState(randomString(16));
    const [expanded, setExpanded] = useState(initiallyExpanded);
    const toggleExpansion = () => setExpanded(!expanded);

    return <Accordion defaultActiveKey={initiallyExpanded ? randomEventKey : undefined}>
        <Card>
            <Accordion.Toggle as={Card.Header} eventKey={randomEventKey} onClick={toggleExpansion}>{expanded ? expandedHeader : contractedHeader}</Accordion.Toggle>
            <Accordion.Collapse eventKey={randomEventKey}>
                <Card.Body className="p-0" style={{ cursor: 'padding' }}>
                    {children}
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    </Accordion>
}

export default AccordionDynamicHeader;
