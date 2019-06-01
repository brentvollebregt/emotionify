import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

interface TrackSortControlProps {
    available_audio_features: AudioFeatureNamePair[],
    available_track_sorting_methods: SortingMethodNamePair[],
    selected_x_axis: AudioFeatureNamePair,
    selected_y_axis: AudioFeatureNamePair,
    selected_sorting_method: SortingMethodNamePair,
    onXAxisSelect: (selection: AudioFeatureNamePair) => void,
    onYAxisSelect: (selection: AudioFeatureNamePair) => void,
    onSortMethodSelect: (selection: SortingMethodNamePair) => void
}

export interface AudioFeatureNamePair {
    audioFeature: string,
    name: string
}

export interface SortingMethodNamePair {
    method: Function,
    name: string
}

const TrackSortControl: React.SFC<TrackSortControlProps> = (props: TrackSortControlProps) => {
    return <>
        <div style={{display: 'inline-block', marginRight: 20, marginTop: 5}}>
            <span>X-Axis: </span>
            <Dropdown style={{display: 'inline'}}>
                <Dropdown.Toggle size="sm" id="X-Axis">{props.selected_x_axis.name}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.available_audio_features.map(af =>
                        <Dropdown.Item key={af.name} onClick={() => props.onXAxisSelect(af)}>{af.name}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>

        <div style={{display: 'inline-block', marginRight: 20, marginTop: 5}}>
            <span>Y-Axis: </span>
            <Dropdown style={{display: 'inline'}}>
                <Dropdown.Toggle size="sm" id="Y-Axis">{props.selected_y_axis.name}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.available_audio_features.map(af =>
                        <Dropdown.Item key={af.name} onClick={() => props.onYAxisSelect(af)}>{af.name}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>

        <div style={{display: 'inline-block', marginRight: 20, marginTop: 5}}>
            <span>Sort Method: </span>
            <Dropdown style={{display: 'inline'}}>
                <Dropdown.Toggle size="sm" id="Sort Method">{props.selected_sorting_method.name}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.available_track_sorting_methods.map(tsm =>
                        <Dropdown.Item key={tsm.name} onClick={() => props.onSortMethodSelect(tsm)}>{tsm.name}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    </>
}

export default TrackSortControl;
