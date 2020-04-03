import React, { useState } from "react";
import cogoToast from "cogo-toast";
import { Button, Dropdown, DropdownButton, FormControl, InputGroup } from "react-bootstrap";
import { BsPrefixProps, ReplaceProps } from "react-bootstrap/helpers";
import { FormControlProps } from "react-bootstrap/FormControl";

interface IProps {
  onExport: (name: string, makePublic: boolean) => Promise<boolean>;
}

export const Export: React.FunctionComponent<IProps> = (props: IProps) => {
  const { onExport } = props;

  const [name, setName] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  const [nameInvalid, setNameInvalid] = useState(false);

  const onNameChange = (
    e: React.FormEvent<ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>>
  ) => {
    if (e.currentTarget.value !== undefined) {
      setName(e.currentTarget.value);
      setNameInvalid(e.currentTarget.value === "");
    }
  };

  const onMakePublicSelect = (makePublic: boolean) => () => setMakePublic(makePublic);

  const onCreate = () => {
    if (name === "") {
      setNameInvalid(true);
    } else {
      onExport(name, makePublic).then((success) => {
        if (success) {
          setName("");
          cogoToast.success(
            "Playlist has been created. You can go to Spotify to see your new playlist.",
            {
              position: "bottom-center",
              heading: "Playlist Created",
              hideAfter: 10,
              onClick: (hide: any) => hide()
            }
          );
        } else {
          cogoToast.error(
            "Failed to create playlist. Make sure you are connected to the internet and that your token is valid.",
            {
              position: "bottom-center",
              heading: "Failed To Create Playlist",
              hideAfter: 10,
              onClick: (hide: any) => hide()
            }
          );
        }
      });
    }
  };

  return (
    <>
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
        />
        <DropdownButton
          as={InputGroup.Append}
          variant={"outline-secondary"}
          title={makePublic ? "Public" : "Private"}
          id="make-private"
        >
          <Dropdown.Item onClick={onMakePublicSelect(false)}>Private</Dropdown.Item>
          <Dropdown.Item onClick={onMakePublicSelect(true)}>Public</Dropdown.Item>
        </DropdownButton>
        <InputGroup.Append>
          <Button variant={"outline-secondary"} onClick={onCreate}>
            Create
          </Button>
        </InputGroup.Append>
      </InputGroup>

      <InputGroup
        className="mb-3 d-inline-flex d-sm-none justify-content-center"
        style={{ maxWidth: 500 }}
      >
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
        />
      </InputGroup>
      <InputGroup
        className="mb-3 d-inline-flex d-sm-none justify-content-center"
        style={{ maxWidth: 500 }}
      >
        <DropdownButton
          as={InputGroup.Prepend}
          variant={"outline-secondary"}
          title={makePublic ? "Public" : "Private"}
          id="make-private"
        >
          <Dropdown.Item onClick={onMakePublicSelect(false)}>Private</Dropdown.Item>
          <Dropdown.Item onClick={onMakePublicSelect(true)}>Public</Dropdown.Item>
        </DropdownButton>
        <InputGroup.Append>
          <Button variant={"outline-secondary"} onClick={onCreate}>
            Create
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </>
  );
};

export default Export;
