import React from 'react';
import { TrackWithAudioFeatures } from './index';

interface PlotProps {
    tracks: TrackWithAudioFeatures[]
}

export interface Point {
    x: number,
    y: number,
    track: {
        id: string,
        title: string,
        artist: string,
        length: number // Could use this for size? (make it a toggle)
    },
}

const Plot: React.SFC<PlotProps> = (props: PlotProps) => {
    const points: Point[] = props.tracks.map(t => {
        return {
            x: t.audioFeatures !== null ? t.audioFeatures.energy : 0,
            y: t.audioFeatures !== null ? t.audioFeatures.valence : 0,
            track: {
                id: t.id,
                title: t.name,
                artist: t.artists.map(a => a.name).join(', '),
                length: t.duration_ms
            }
        }
    });

    return <>
        <div>Points: {points.length}</div>
    </>
}

export default Plot;