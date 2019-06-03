import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Alert from 'react-bootstrap/Alert'
import { BsPrefixProps, ReplaceProps } from 'react-bootstrap/helpers'
import { FormControlProps } from 'react-bootstrap/FormControl'


interface IProps {
    onExport: (name: string, makePublic: boolean) => Promise<boolean>
}

interface IState {
    name: string,
    makePublic: boolean,
    nameInvalid: boolean,
    complete: boolean,
}

class Export extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            name: '',
            makePublic: false,
            nameInvalid: false,
            complete: false
        }

        this.onPlaylistNameChange = this.onPlaylistNameChange.bind(this);
        this.onPublicPrivateSelect = this.onPublicPrivateSelect.bind(this);
        this.onCreateClick = this.onCreateClick.bind(this);
    }

    onPlaylistNameChange(e: React.FormEvent<ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>>): void {
        if (e.currentTarget.value !== undefined && !this.state.complete) { // No entry in the time the form is green
            console.log(e.currentTarget.value, e.currentTarget.value !== '' );
            this.setState({ 
                name: e.currentTarget.value, 
                nameInvalid: e.currentTarget.value === '' 
            });
        }
    }

    onPublicPrivateSelect(makePublic: boolean) {
        this.setState({ makePublic: makePublic });
    }

    onCreateClick() {
        if (this.state.name === '') {
            this.setState({ nameInvalid: true });
        } else {
            this.props.onExport(this.state.name, this.state.makePublic)
                .then(success => {
                    if (success) {
                        this.setState({ complete: true });
                    } else {
                        alert('Failed to create playlist');
                    }
                    setTimeout(() => {
                        this.setState({ complete: false, name: '' });
                    }, 2500);
                });
        }
    }

    render() {
        const { name, makePublic, nameInvalid, complete } = this.state;
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
                    isInvalid={nameInvalid}
                    isValid={complete}
                />
                <DropdownButton
                    as={InputGroup.Append}
                    variant={complete ? 'outline-success' : 'outline-secondary'}
                    title={makePublic ? 'Public' : 'Private'}
                    id="make-private"
                >
                    <Dropdown.Item onClick={() => this.onPublicPrivateSelect(false)}>Private</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onPublicPrivateSelect(true)}>Public</Dropdown.Item>
                </DropdownButton>
                <InputGroup.Append>
                    <Button variant={complete ? 'outline-success' : 'outline-secondary'} onClick={this.onCreateClick}>Create</Button>
                </InputGroup.Append>
            </InputGroup>
        </>
    }
}

export default Export;
