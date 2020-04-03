import React, { useEffect, useState } from "react";
import { DropdownButton, Dropdown, InputGroup } from "react-bootstrap";
import { FilterFunctionProps } from "./filter";
import { TrackWithAudioFeatures, availableTrackAudioFeatures } from "../../models/Spotify";

interface IProps extends FilterFunctionProps {}

const FilterOrderByAudioFeature: React.FunctionComponent<IProps> = (props: IProps) => {
  const { outputCallback } = props;

  const [feature, setFeature] = useState("Energy");

  useEffect(() => {
    const audio_feature_key: keyof SpotifyApi.AudioFeaturesObject =
      availableTrackAudioFeatures[feature].key;
    outputCallback(
      (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] =>
        tracks.sort((a: TrackWithAudioFeatures, b: TrackWithAudioFeatures): number => {
          const a_audio_feature_value: number =
            a.audio_features === undefined || a.audio_features === null
              ? 0
              : (a.audio_features[audio_feature_key] as number);
          const b_audio_feature_value: number =
            b.audio_features === undefined || b.audio_features === null
              ? 0
              : (b.audio_features[audio_feature_key] as number);
          return b_audio_feature_value - a_audio_feature_value;
        }),
      `Order songs by ${feature}`
    );
  }, [feature]);

  const setFeatureFromDropdown = (featureValue: string) => () => setFeature(featureValue);

  return (
    <>
      <InputGroup className="mb-1 d-inline-flex w-auto">
        <InputGroup.Prepend>
          <InputGroup.Text>Audio Feature</InputGroup.Text>
        </InputGroup.Prepend>
        <DropdownButton as={InputGroup.Append} id="dropdown-feature" title={feature}>
          {Object.keys(availableTrackAudioFeatures).map((af) => (
            <Dropdown.Item key={af} onClick={setFeatureFromDropdown(af)}>
              {af}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>
    </>
  );
};

export default FilterOrderByAudioFeature;
