import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, FormControl } from "react-bootstrap";
import { FormControlProps } from "react-bootstrap/FormControl";
import { ReplaceProps, BsPrefixProps } from "react-bootstrap/helpers";
import { FilterFunctionProps } from "./filter";
import { TrackWithAudioFeatures, availableTrackAudioFeatures } from "../../models/Spotify";

interface IProps extends FilterFunctionProps {}

const operators: { [key: string]: (track_value: number, user_value: number) => boolean } = {
  "==": (track_value, user_value) => track_value === user_value,
  ">": (track_value, user_value) => track_value > user_value,
  "<": (track_value, user_value) => track_value < user_value,
  ">=": (track_value, user_value) => track_value >= user_value,
  "<=": (track_value, user_value) => track_value <= user_value
};
const xor = (a: boolean, b: boolean): boolean => (a && !b) || (!a && b);

const FilterAudioFeaturePredicate: React.FunctionComponent<IProps> = (props: IProps) => {
  const { outputCallback } = props;

  const [include, setInclude] = useState(true);
  const [feature, setFeature] = useState("Energy");
  const [operator, setOperator] = useState(">");
  const [value, setValue] = useState<string>("0.5");

  useEffect(() => {
    const value_as_number = parseFloat(value);
    if (isNaN(value_as_number)) {
      outputCallback(undefined, "Please specify a number to filter on");
    } else {
      const audio_feature_key: keyof SpotifyApi.AudioFeaturesObject =
        availableTrackAudioFeatures[feature].key;
      outputCallback(
        (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] =>
          tracks.filter((track) =>
            xor(
              track.audio_features !== undefined &&
                track.audio_features !== null &&
                operators[operator](
                  track.audio_features[audio_feature_key] as number,
                  value_as_number
                ),
              !include
            )
          ),
        `${include ? "Include" : "Exclude"} songs where ${feature} ${operator} ${value}`
      );
    }
  }, [include, feature, operator, value]);

  const setIncludeFromDropdown = (includeValue: boolean) => () => setInclude(includeValue);
  const setFeatureFromDropdown = (featureValue: string) => () => setFeature(featureValue);
  const setOperatorFromDropdown = (operatorValue: string) => () => setOperator(operatorValue);
  const setvalueFromDropdown = (
    event: React.FormEvent<ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>>
  ) => setValue(event.currentTarget.value === undefined ? "" : event.currentTarget.value);

  return (
    <div className="d-inline-flex w-100">
      <DropdownButton
        id="dropdown-include"
        title={include ? "Include" : "Exclude"}
        className="my-1 d-inline"
      >
        <Dropdown.Item onClick={setIncludeFromDropdown(true)}>Include</Dropdown.Item>
        <Dropdown.Item onClick={setIncludeFromDropdown(false)}>Exclude</Dropdown.Item>
      </DropdownButton>

      <DropdownButton id="dropdown-feature" title={feature} className="ml-1 my-1 d-inline">
        {Object.keys(availableTrackAudioFeatures).map((af) => (
          <Dropdown.Item key={af} onClick={setFeatureFromDropdown(af)}>
            {af}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      <DropdownButton id="dropdown-operator" title={operator} className="ml-1 my-1 d-inline">
        {Object.keys(operators).map((op) => (
          <Dropdown.Item key={op} onClick={setOperatorFromDropdown(op)}>
            {op}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      <FormControl
        placeholder="Value"
        aria-label="Value"
        type="number"
        value={value === undefined ? "" : value + ""}
        onChange={setvalueFromDropdown}
        className="ml-1 my-1 d-inline"
        style={{ maxWidth: 400 }}
      />
    </div>
  );
};

export default FilterAudioFeaturePredicate;
