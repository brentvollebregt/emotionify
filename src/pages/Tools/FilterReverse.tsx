import React, { useEffect } from "react";
import { FilterFunctionProps } from "./filter";
import { TrackWithAudioFeatures } from "../../models/Spotify";

interface IProps extends FilterFunctionProps {}

const filter = (tracks: TrackWithAudioFeatures[]): TrackWithAudioFeatures[] => tracks.reverse();

const FilterReverse: React.FunctionComponent<IProps> = (props: IProps) => {
  const { outputCallback } = props;

  useEffect(() => {
    outputCallback(filter, "Reverse song order");
  }, []);

  return (
    <>
      <p className="lead">Reverse all tracks</p>
    </>
  );
};

export default FilterReverse;
