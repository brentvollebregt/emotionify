/*
* Different methods of sorting x y points
*/

export interface SortablePoint {
    id: any,
    x: number,
    y: number
}

export const availableSortingMethods: {[key: string]: Function} = {
    'Distance From Origin': originDistance,
    'Nearest Neighbour': nearestNeighbourFromOrigin,
    'No Sorting': noSort
}

function distanceToPoint(xOrigin: number, yOrigin: number, x: number, y: number): number {
    let a = xOrigin - x;
    let b = yOrigin - y;
    return Math.sqrt((a*a) + (b*b));
}

// Sort points based off their distance from the origin. Not great as it could jump from 1,0 to 0,1
export function originDistance(points: SortablePoint[]): SortablePoint[] {
    let distances_from_origin = points.map(p => {
        return {...p, distance: distanceToPoint(0, 0, p.x, p.y)}
    });
    return distances_from_origin.sort((a, b) => a.distance - b.distance);
}

// Sorts points by going point to point based off the closest left-over points. Starts at 0,0.
export function nearestNeighbourFromOrigin(points: SortablePoint[]): SortablePoint[] {
    let nearest_point_to_origin = points.reduce((accumulator: SortablePoint, currentValue: SortablePoint): SortablePoint => {
        let acc_dist = distanceToPoint(0, 0, accumulator.x, accumulator.y);
        let curr_dist = distanceToPoint(0, 0, currentValue.x, currentValue.y);
        return acc_dist > curr_dist ? currentValue : accumulator;
    });

    let sorted_points: SortablePoint[] = [nearest_point_to_origin]; // Put the closest point to 0, 0 in the sorted list
    let points_left: SortablePoint[] = points.slice(); // Make a copy
    points_left = points_left.filter(p => p.id !== nearest_point_to_origin.id); // Remove nearest point

    let current_point: SortablePoint = nearest_point_to_origin;
    const reduce_to_closest_point = (accumulator: SortablePoint, currentValue: SortablePoint): SortablePoint => { // Keep function out of the loop
        let acc_dist = distanceToPoint(current_point.x, current_point.y, accumulator.x, accumulator.y);
        let curr_dist = distanceToPoint(current_point.x, current_point.y, currentValue.x, currentValue.y);
        return acc_dist > curr_dist ? currentValue : accumulator;
    };
    while (points_left.length > 0) {
        let closest_point: SortablePoint = points_left.reduce(reduce_to_closest_point);
        sorted_points.push(closest_point);
        points_left = points_left.filter(p => p.id !== closest_point.id);
        current_point = closest_point;
    }

    return sorted_points;
}

export function noSort(points: SortablePoint[]): SortablePoint[] {
    return points;
}