import { TrackWithAudioFeatures } from "../models/Spotify";

/*
 * Different methods of sorting x y points
 */

export interface SortablePoint {
  id: any;
  x: number;
  y: number;
}

export interface IndexedTrackId {
  // Minimal stored data
  id: string;
  index: {
    before: number;
    after: number;
  };
}

export interface SpotifyTrackWithIndexes extends TrackWithAudioFeatures, IndexedTrackId {} // Not used here but relates to methods here

export const availableSortingMethods: { [key: string]: Function } = {
  "Distance From Origin": originDistance,
  "Nearest Neighbour": nearestNeighbourFromOrigin,
  "X Axis": xAxis,
  "Y Axis": yAxis,
  "No Sorting": noSort
};

function distanceToPoint(xOrigin: number, yOrigin: number, x: number, y: number): number {
  let a = xOrigin - x;
  let b = yOrigin - y;
  return Math.sqrt(a * a + b * b);
}

// Sort points based off their distance from the origin. Not great as it could jump from 1,0 to 0,1
export function originDistance(points: SortablePoint[]): SortablePoint[] {
  let distances_from_origin = points.map((p) => {
    return { ...p, distance: distanceToPoint(0, 0, p.x, p.y) };
  });
  return distances_from_origin.sort((a, b) => a.distance - b.distance);
}

// Sorts points by going point to point based off the closest left-over points. Starts at 0,0.
export function nearestNeighbourFromOrigin(points: SortablePoint[]): SortablePoint[] {
  if (points.length === 0) {
    return [];
  }

  let nearest_point_to_origin = points.reduce(
    (accumulator: SortablePoint, currentValue: SortablePoint): SortablePoint => {
      let acc_dist = distanceToPoint(0, 0, accumulator.x, accumulator.y);
      let curr_dist = distanceToPoint(0, 0, currentValue.x, currentValue.y);
      return acc_dist > curr_dist ? currentValue : accumulator;
    }
  );

  let sorted_points: SortablePoint[] = [nearest_point_to_origin]; // Put the closest point to 0, 0 in the sorted list
  let points_left: SortablePoint[] = points.slice(); // Make a copy
  points_left = points_left.filter((p) => p.id !== nearest_point_to_origin.id); // Remove nearest point

  let current_point: SortablePoint = nearest_point_to_origin;
  const reduce_to_closest_point = (
    accumulator: SortablePoint,
    currentValue: SortablePoint
  ): SortablePoint => {
    // Keep function out of the loop
    let acc_dist = distanceToPoint(current_point.x, current_point.y, accumulator.x, accumulator.y);
    let curr_dist = distanceToPoint(
      current_point.x,
      current_point.y,
      currentValue.x,
      currentValue.y
    );
    return acc_dist > curr_dist ? currentValue : accumulator;
  };
  while (points_left.length > 0) {
    let closest_point: SortablePoint = points_left.reduce(reduce_to_closest_point);
    sorted_points.push(closest_point);
    points_left = points_left.filter((p) => p.id !== closest_point.id);
    current_point = closest_point;
  }

  return sorted_points;
}

// Return the data provided
export function noSort(points: SortablePoint[]): SortablePoint[] {
  return points;
}

// Sort by x
export function xAxis(points: SortablePoint[]): SortablePoint[] {
  return points.sort((a, b) => {
    return a.x === b.x ? 0 : a.x > b.x ? 1 : -1;
  });
}

// Sort by y
export function yAxis(points: SortablePoint[]): SortablePoint[] {
  return points.sort((a, b) => {
    return a.y === b.y ? 0 : a.y > b.y ? 1 : -1;
  });
}

// Sort tracks given x and y features and a sorting method
export function sort(
  tracks: TrackWithAudioFeatures[],
  x_audio_feature: keyof SpotifyApi.AudioFeaturesObject,
  y_audio_feature: keyof SpotifyApi.AudioFeaturesObject,
  sorting_method: Function
): IndexedTrackId[] {
  // Get points initial indexes (to calculate movement)
  let tracks_with_playlist_indexes: IndexedTrackId[] = tracks.map((t, i) => {
    return { id: t.id, index: { before: i, after: 0 } };
  });

  // Convert tracks to sortable points
  let tracks_as_sp: SortablePoint[] = tracks.map((t) => {
    if (t.audio_features !== undefined && t.audio_features !== null) {
      let x = t.audio_features[x_audio_feature] as number; // We know better than the compiler
      let y = t.audio_features[y_audio_feature] as number;
      return { id: t.id, x: x, y: y };
    } else {
      // Commonly occurs as t.audioFeatures === undefined on first playlist selection
      return { id: t.id, x: 0, y: 0 };
    }
  });

  // Sort the sortable points
  let tracks_as_sp_sorted: SortablePoint[] = sorting_method(tracks_as_sp);

  // Calculate new indexes using the sorted points
  let tracks_with_sorted_indexes: IndexedTrackId[] = tracks_as_sp_sorted
    .map((sp, i) => {
      let track = tracks_with_playlist_indexes.find((t) => t.id === sp.id);
      if (track !== undefined) {
        return { ...track, index: { before: track.index.before, after: i } };
      } else {
        console.error("[TrackTable:tracks_with_sorted_indexes] Cannot find match for: " + sp.id);
        return null;
      }
    })
    .filter((t: IndexedTrackId | null): t is IndexedTrackId => t !== null);

  // Quick debugging verification
  if (tracks_with_sorted_indexes.length !== tracks.length) {
    console.error("PointSorting.sort did not output the same amount of tracks input");
  }

  // Sort tracks by the new indexes
  return tracks_with_sorted_indexes.sort((a, b) => a.index.after - b.index.after);
}
