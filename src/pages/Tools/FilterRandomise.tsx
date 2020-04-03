import React, { useEffect } from "react";
import { FilterFunctionProps } from "./filter";
import { TrackWithAudioFeatures } from "../../models/Spotify";

interface IProps extends FilterFunctionProps {}

const filter = (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] => {
  let randomised_tracks = [...tracks];
  for (let i = randomised_tracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomised_tracks[i], randomised_tracks[j]] = [randomised_tracks[j], randomised_tracks[i]];
  }
  return randomised_tracks;
};

const FilterRandomise: React.FunctionComponent<IProps> = (props: IProps) => {
  const { outputCallback } = props;

  useEffect(() => {
    outputCallback(filter, "Randomise song order");
  }, []);

  return (
    <>
      <p className="lead">Randomise song order</p>
    </>
  );
};

export default FilterRandomise;
