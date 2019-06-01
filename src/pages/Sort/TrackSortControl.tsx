import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

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
        <div style={{display: 'inline-block', marginRight: 20, marginTop: 5}}>
            <span>X-Axis: </span>
            <Dropdown style={{display: 'inline'}}>
                <Dropdown.Toggle size="sm" id="X-Axis">{props.selected_x_axis}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.available_audio_features.map(audio_feature =>
                        <Dropdown.Item key={audio_feature} onClick={() => props.onXAxisSelect(audio_feature)}>{audio_feature}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>

        <div style={{display: 'inline-block', marginRight: 20, marginTop: 5}}>
            <span>Y-Axis: </span>
            <Dropdown style={{display: 'inline'}}>
                <Dropdown.Toggle size="sm" id="Y-Axis">{props.selected_y_axis}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.available_audio_features.map(audio_feature =>
                        <Dropdown.Item key={audio_feature} onClick={() => props.onYAxisSelect(audio_feature)}>{audio_feature}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>

        <div style={{display: 'inline-block', marginRight: 20, marginTop: 5}}>
            <span>Sort Method: </span>
            <Dropdown style={{display: 'inline'}}>
                <Dropdown.Toggle size="sm" id="Sort Method">{props.selected_sorting_method}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.available_track_sorting_methods.map(sorting_method =>
                        <Dropdown.Item key={sorting_method} onClick={() => props.onSortMethodSelect(sorting_method)}>{sorting_method}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    </>
}

export default TrackSortControl;
