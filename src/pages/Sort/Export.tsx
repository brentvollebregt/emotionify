import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import { BsPrefixProps, ReplaceProps } from 'react-bootstrap/helpers'
import { FormControlProps } from 'react-bootstrap/FormControl'

interface IProps {
    onExport: (name: string, makePublic: boolean) => Promise<boolean>
}

export const Export: React.FunctionComponent<IProps> = (props: IProps) => {
    const { onExport } = props;

    const [name, setName] = useState('');
    const [makePublic, setMakePublic] = useState(false);
    const [nameInvalid, setNameInvalid] = useState(false);
    const [complete, setComplete] = useState(false);

    const onNameChange = (e: React.FormEvent<ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>>) => {
        if (e.currentTarget.value !== undefined && !complete) { // No entry in the time the form is green
            setName(e.currentTarget.value);
            setNameInvalid(e.currentTarget.value === '' );
        }
    }

    const onMakePublicSelect = (makePublic: boolean) => () => setMakePublic(makePublic);

    const onCreate = () => {
        if (name === '') {
            setNameInvalid(true);
        } else {
            onExport(name, makePublic)
                .then(success => {
                    if (success) {
                        setComplete(true);
                        setTimeout(() => {
                            setComplete(false);
                            setName('');
                        }, 2500);
                    } else {
                        alert('Failed to create playlist.\nPlease make sure you have an internet connection.');
                    }
                });
        }
    }

    return <>
        <h4 className="mb-2">Create New Playlist</h4>
        <InputGroup className="mb-3 d-none d-sm-inline-flex" style={{ maxWidth: 500 }}>
            <InputGroup.Prepend>
                <InputGroup.Text id="playlist-name">Playlist Name</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                placeholder="Playlist Name"
                aria-label="Playlist Name"
                aria-describedby="playlist-name"
                value={name}
                onChange={onNameChange}
                isInvalid={nameInvalid}
                isValid={complete}
            />
            <DropdownButton
                as={InputGroup.Append}
                variant={complete ? 'outline-success' : 'outline-secondary'}
                title={makePublic ? 'Public' : 'Private'}
                id="make-private"
            >
                <Dropdown.Item onClick={onMakePublicSelect(false)}>Private</Dropdown.Item>
                <Dropdown.Item onClick={onMakePublicSelect(true)}>Public</Dropdown.Item>
            </DropdownButton>
            <InputGroup.Append>
                <Button variant={complete ? 'outline-success' : 'outline-secondary'} onClick={onCreate}>Create</Button>
            </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3 d-inline-flex d-sm-none" style={{ maxWidth: 500, justifyContent: 'center' }}>
            <InputGroup.Prepend>
                <InputGroup.Text id="playlist-name">Playlist Name</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                placeholder="Playlist Name"
                aria-label="Playlist Name"
                aria-describedby="playlist-name"
                value={name}
                onChange={onNameChange}
                isInvalid={nameInvalid}
                isValid={complete}
            />
        </InputGroup>
        <InputGroup className="mb-3 d-inline-flex d-sm-none" style={{ maxWidth: 500, justifyContent: 'center' }}>
            <DropdownButton
                as={InputGroup.Prepend}
                variant={complete ? 'outline-success' : 'outline-secondary'}
                title={makePublic ? 'Public' : 'Private'}
                id="make-private"
            >
                <Dropdown.Item onClick={onMakePublicSelect(false)}>Private</Dropdown.Item>
                <Dropdown.Item onClick={onMakePublicSelect(true)}>Public</Dropdown.Item>
            </DropdownButton>
            <InputGroup.Append>
                <Button variant={complete ? 'outline-success' : 'outline-secondary'} onClick={onCreate}>Create</Button>
            </InputGroup.Append>
        </InputGroup>
    </>
}

export default Export;
