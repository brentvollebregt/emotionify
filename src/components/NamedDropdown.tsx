import React, { useState } from "react";
import { Dropdown, DropdownButton, InputGroup } from "react-bootstrap";
import { randomString } from "../logic/Utils";

interface IProps {
  available_values: string[];
  selected_value: string;
  title: string;
  onSelect: (value: string) => void;
  className?: string;
}

const NamedDropdown: React.FunctionComponent<IProps> = (props: IProps) => {
  const { available_values, selected_value, title, onSelect, className } = props;

  const [id] = useState("dropdown_" + randomString(16));

  const onComponentAudioFeatureSelect = (audioFeature: string) => () => onSelect(audioFeature);

  return (
    <InputGroup className={`mt-1 d-inline-flex w-auto ${className !== undefined ? className : ""}`}>
      <InputGroup.Prepend>
        <InputGroup.Text>{title}</InputGroup.Text>
      </InputGroup.Prepend>
      <DropdownButton
        as={InputGroup.Append}
        variant="outline-secondary"
        title={selected_value}
        id={id}
      >
        {available_values.map((audio_feature) => (
          <Dropdown.Item key={audio_feature} onClick={onComponentAudioFeatureSelect(audio_feature)}>
            {audio_feature}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </InputGroup>
  );
};

export default NamedDropdown;
