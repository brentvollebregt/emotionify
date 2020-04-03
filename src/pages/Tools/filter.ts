import { TrackWithAudioFeatures } from "../../models/Spotify";

export interface FilterFunctionProps {
  outputCallback: (
    filter: ((tracks: TrackWithAudioFeatures[]) => TrackWithAudioFeatures[]) | undefined,
    titleText: string
  ) => void;
}
