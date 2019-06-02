import React from 'react';
import { SpotifyTrack } from '../../Models';

interface IProps {
    tracks: SpotifyTrack[]
}

interface Point {
    x: number,
    y: number,
    track: {
        id: string,
        title: string,
        artist: string,
        length: number // Could use this for size? (make it a toggle)
    },
}

const Plot: React.SFC<IProps> = (props: IProps) => {
    const points: Point[] = props.tracks.map(t => {
        return {
            x: t.audio_features !== null ? t.audio_features.energy : 0,
            y: t.audio_features !== null ? t.audio_features.valence : 0,
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
