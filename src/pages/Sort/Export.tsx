import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import { BsPrefixProps, ReplaceProps } from 'react-bootstrap/helpers'
import { FormControlProps } from 'react-bootstrap/FormControl'


interface IProps {
    onExport: (name: string, makePublic: boolean) => void
}

interface IState {
    name: string,
    makePublic: boolean
}

class Export extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            name: '',
            makePublic: false
        }

        this.onPlaylistNameChange = this.onPlaylistNameChange.bind(this);
        this.onPublicPrivateSelect = this.onPublicPrivateSelect.bind(this);
        this.onCreateClick = this.onCreateClick.bind(this);
    }

    onPlaylistNameChange(e: React.FormEvent<ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>>): void {
        if (e.currentTarget.value !== undefined) {
            this.setState({ name: e.currentTarget.value });
        }
    }

    onPublicPrivateSelect(makePublic: boolean) {
        this.setState({ makePublic: makePublic });
    }

    onCreateClick() {
        this.props.onExport(this.state.name, this.state.makePublic);
    }

    render() {
        const { name, makePublic } = this.state;
        return <>
            <h4 className="mb-2">Create New Playlist</h4>
            <InputGroup className="mb-3" style={{ maxWidth: 500, display: 'inline-flex' }}>
                <InputGroup.Prepend>
                    <InputGroup.Text id="playlist-name">Playlist Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    placeholder="Playlist Name"
                    aria-label="Playlist Name"
                    aria-describedby="playlist-name"
                    value={name}
                    onChange={this.onPlaylistNameChange}
                />
                <DropdownButton
                    as={InputGroup.Append}
                    variant="outline-secondary"
                    title={makePublic ? 'Public' : 'Private'}
                    id="make-private"
                >
                    <Dropdown.Item onClick={() => this.onPublicPrivateSelect(false)}>Private</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onPublicPrivateSelect(true)}>Public</Dropdown.Item>
                </DropdownButton>
                <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={this.onCreateClick}>Create</Button>
                </InputGroup.Append>
            </InputGroup>
        </>
    }
}

export default Export;
