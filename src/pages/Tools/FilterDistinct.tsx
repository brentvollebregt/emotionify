import React, { useEffect } from "react";
import { FilterFunctionProps } from "./filter";
import { TrackWithAudioFeatures } from "../../models/Spotify";

interface IProps extends FilterFunctionProps {}

const filter = (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] =>
  tracks.filter((value, index, self) => self.findIndex((t) => t.id === value.id) === index);

const FilterDistinct: React.FunctionComponent<IProps> = (props: IProps) => {
  const { outputCallback } = props;

  useEffect(() => {
    outputCallback(filter, "Remove duplicate songs");
  }, []);

  return (
    <>
      <p className="lead">Remove duplicate songs</p>
    </>
  );
};

export default FilterDistinct;
