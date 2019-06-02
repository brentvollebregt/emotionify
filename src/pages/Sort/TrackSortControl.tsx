import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';

interface IProps {
    available_audio_features: string[],
    available_track_sorting_methods: string[],
    selected_x_axis: string,
    selected_y_axis: string,
    selected_sorting_method: string,
    onXAxisSelect: (selection: string) => void,
    onYAxisSelect: (selection: string) => void,
    onSortMethodSelect: (selection: string) => void
}

const TrackSortControl: React.SFC<IProps> = (props: IProps) => {
    return <>
        <InputGroup className="mr-3" style={{display: 'inline-flex', width: 'auto'}}>
            <InputGroup.Prepend>
                <InputGroup.Text>X-Axis</InputGroup.Text>
            </InputGroup.Prepend>
            <DropdownButton
                as={InputGroup.Append}
                variant="primary"
                title={props.selected_x_axis}
                id="X-Axis"
            >
                {props.available_audio_features.map(audio_feature =>
                    <Dropdown.Item key={audio_feature} onClick={() => props.onXAxisSelect(audio_feature)}>{audio_feature}</Dropdown.Item>
                )}
            </DropdownButton>
        </InputGroup>

        <InputGroup className="mr-3" style={{display: 'inline-flex', width: 'auto'}}>
            <InputGroup.Prepend>
                <InputGroup.Text>Y-Axis</InputGroup.Text>
            </InputGroup.Prepend>
            <DropdownButton
                as={InputGroup.Append}
                variant="primary"
                title={props.selected_y_axis}
                id="Y-Axis"
            >
                {props.available_audio_features.map(audio_feature =>
                    <Dropdown.Item key={audio_feature} onClick={() => props.onYAxisSelect(audio_feature)}>{audio_feature}</Dropdown.Item>
                )}
            </DropdownButton>
        </InputGroup>

        <InputGroup style={{display: 'inline-flex', width: 'auto'}}>
            <InputGroup.Prepend>
                <InputGroup.Text>Sort Method</InputGroup.Text>
            </InputGroup.Prepend>
            <DropdownButton
                as={InputGroup.Append}
                variant="primary"
                title={props.selected_sorting_method}
                id="Sort-Method"
            >
                {props.available_track_sorting_methods.map(sorting_method =>
                    <Dropdown.Item key={sorting_method} onClick={() => props.onSortMethodSelect(sorting_method)}>{sorting_method}</Dropdown.Item>
                )}
            </DropdownButton>
        </InputGroup>
    </>
}

export default TrackSortControl;
