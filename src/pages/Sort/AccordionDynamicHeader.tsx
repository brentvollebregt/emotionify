import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';


interface IProps {
    name: string,
    contractedHeader: string,
    expandedHeader: string,
    children: React.ReactNode,
    initiallyExpanded: boolean
}

interface IState {
    expanded: boolean
}

class AccordionDynamicHeader extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            expanded: props.initiallyExpanded
        }

        this.onHeaderClick = this.onHeaderClick.bind(this);
    }

    onHeaderClick() {
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        const { expanded: open } = this.state;
        const { name, contractedHeader, expandedHeader, children, initiallyExpanded } = this.props;
        return <Accordion defaultActiveKey={initiallyExpanded ? name : undefined} onClick={this.onHeaderClick}>
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey={name}>{open ? expandedHeader : contractedHeader}</Accordion.Toggle>
                <Accordion.Collapse eventKey={name}>
                    <Card.Body className="p-0" style={{ cursor: 'padding' }}>
                        {children}
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    }
}

export default AccordionDynamicHeader;
