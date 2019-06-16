import React from 'react';
import Plot from 'react-plotly.js';
import { TrackWithAudioFeatures } from '../../models/Spotify';

interface IProps {
    tracks: TrackWithAudioFeatures[],
    selected_x_axis: string,
    selected_y_axis: string,
    selected_x_axis_name: string,
    selected_y_axis_name: string
}

interface Point {
    x: number,
    y: number
}

interface TrackPoint extends Point {
    track: {
        id: string,
        title: string,
        artist: string,
        length: number
    },
}

function getDistancePercentageAlongLineTheOfClosestPointOnLineToAnArbitaryPoint(start: Point, end: Point, point: Point): number {
    // Modified from https://jsfiddle.net/soulwire/UA6H5/
    let atob = { x: end.x - start.x, y: end.y - start.y };
    let atop = { x: point.x - start.x, y: point.y - start.y };
    let len = atob.x * atob.x + atob.y * atob.y;
    let dot = atop.x * atob.x + atop.y * atob.y;
    let t = Math.min( 1, Math.max( 0, dot / len ) );

    // dot = ( end.x - start.x ) * ( point.y - start.y ) - ( end.y - start.y ) * ( point.x - start.x );
    // let distance_along_line = t;
    // let distance_away_from_line = dot;
    // let on_the_line = dot < 1;
    // let x = start.x + atob.x * t;
    // let y = start.y + atob.y * t;

    return t;
}

function getPointAlongColourGradient(start_hex_colour: string, end_hex_colour: string, percentage: number): string {
    const hex = (x: number): string => {
        let tmp = x.toString(16);
        return (tmp.length === 1) ? '0' + tmp : tmp;
    }

    var r = Math.ceil(parseInt(end_hex_colour.substring(0,2), 16) * percentage + parseInt(start_hex_colour.substring(0,2), 16) * (1-percentage));
    var g = Math.ceil(parseInt(end_hex_colour.substring(2,4), 16) * percentage + parseInt(start_hex_colour.substring(2,4), 16) * (1-percentage));
    var b = Math.ceil(parseInt(end_hex_colour.substring(4,6), 16) * percentage + parseInt(start_hex_colour.substring(4,6), 16) * (1-percentage));
    return hex(r) + hex(g) + hex(b);
}

const PlotTracks: React.FunctionComponent<IProps> = (props: IProps) => {
    const points: TrackPoint[] = props.tracks.map(t => {
        let track = {
            id: t.id,
            title: t.name,
            artist: t.artists.map(a => a.name).join(', '),
            length: t.duration_ms
        }

        if (t.audio_features !== undefined) {
            let x = (t.audio_features[(props.selected_x_axis as keyof SpotifyApi.AudioFeaturesObject)] as number);
            let y = (t.audio_features[(props.selected_y_axis as keyof SpotifyApi.AudioFeaturesObject)] as number);
            return { x: x, y: y, track: track }
        } else { // Commonly occurs as t.audioFeatures === undefined on first playlist selection
            return { x: 0, y: 0, track: track }
        }
    });
    
    let min_x: number = Math.min(...points.map(p => p.x));
    let min_y: number = Math.min(...points.map(p => p.y));
    let max_x: number = Math.max(...points.map(p => p.x));
    let max_y: number = Math.max(...points.map(p => p.y));

    return <Plot
        data={[{
            y: points.map(p => p.y),
            x: points.map(p => p.x),
            text: points.map(p => p.track.title + ' by ' + p.track.artist + '<br>' + props.selected_x_axis_name + ': ' + p.x + '<br>' + props.selected_y_axis_name + ': ' + p.y),
            hoverinfo: "text",
            mode: "lines+markers",
            marker: {
                size: 10,
                color: points.map(p => {
                    let distanceAlongGradient = getDistancePercentageAlongLineTheOfClosestPointOnLineToAnArbitaryPoint({x: min_x, y: min_y}, {x: max_x, y: max_y}, {x: p.x, y: p.y});
                    return '#' + getPointAlongColourGradient('00529d', 'eb121b', distanceAlongGradient);
                })
            },
            line: {
                color: 'rgba(44, 48, 51, 0.5)',
                width: 1
            }
        }]}
        layout={{ hovermode: "closest", margin: {t: 0, b: 0, l: 0, r: 0}, plot_bgcolor: 'transparent', paper_bgcolor: 'transparent' }}
        useResizeHandler={true}
        style={{ 
            width: "100%",
            maxWidth: 700,
            height: 450,
            margin: 'auto',
            border: '2px solid #6c757d',
            overflow: 'hidden',
            borderRadius: 10
        }}
    />
}

export default PlotTracks;
