import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { randomString } from '../logic/Utils';

interface IProps {
    available_values: string[],
    selected_value: string,
    title: string,
    onSelect: (value: string) => void,
    className?: string
}

const NamedDropdown: React.FunctionComponent<IProps> = (props: IProps) => {
    const { available_values, selected_value, title, onSelect, className } = props;

    const [id] = useState('dropdown_' + randomString(16));

    const onComponentAudioFeatureSelect = (audioFeature: string) => () => onSelect(audioFeature);

    return <InputGroup className={className === undefined ? "mt-1" : "mt-1 " + className} style={{display: 'inline-flex', width: 'auto'}}>
        <InputGroup.Prepend>
            <InputGroup.Text>{title}</InputGroup.Text>
        </InputGroup.Prepend>
        <DropdownButton
            as={InputGroup.Append}
            variant="outline-secondary"
            title={selected_value}
            id={id}
        >
            {available_values.map(audio_feature =>
                <Dropdown.Item key={audio_feature} onClick={onComponentAudioFeatureSelect(audio_feature)}>{audio_feature}</Dropdown.Item>
            )}
        </DropdownButton>
    </InputGroup>;
}

export default NamedDropdown;
