import React from "react";
import NamedDropdown from "../../components/NamedDropdown";

interface IProps {
  available_audio_features: string[];
  available_track_sorting_methods: string[];
  selected_x_axis: string;
  selected_y_axis: string;
  selected_sorting_method: string;
  onXAxisSelect: (selection: string) => void;
  onYAxisSelect: (selection: string) => void;
  onSortMethodSelect: (selection: string) => void;
}

const TrackSortControl: React.FunctionComponent<IProps> = (props: IProps) => {
  const {
    available_audio_features,
    available_track_sorting_methods,
    selected_x_axis,
    selected_y_axis,
    selected_sorting_method
  } = props;
  const { onXAxisSelect, onYAxisSelect, onSortMethodSelect } = props;

  return (
    <>
      <NamedDropdown
        available_values={available_audio_features}
        selected_value={selected_x_axis}
        title="X-Axis ( ↔ )"
        onSelect={onXAxisSelect}
        className="mr-3"
      />

      <NamedDropdown
        available_values={available_audio_features}
        selected_value={selected_y_axis}
        title="Y-Axis ( ↕ )"
        onSelect={onYAxisSelect}
        className="mr-3"
      />

      <NamedDropdown
        available_values={available_track_sorting_methods}
        selected_value={selected_sorting_method}
        title="Sort Method"
        onSelect={onSortMethodSelect}
      />
    </>
  );
};

export default TrackSortControl;
