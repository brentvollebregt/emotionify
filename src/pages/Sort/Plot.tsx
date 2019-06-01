import React from 'react';

interface PlotProps {
    points: Point[]
}

export interface Point {
    x: number,
    y: number,
    track: {
        title: string,
        artist: string,
        length: number // Could use this for size? (make it a toggle)
    },
}

const Plot: React.SFC<PlotProps> = (props: PlotProps) => {
    const { points } = props;
    return <>
        <div>Points: {points.length}</div>
    </>
}

export default Plot;