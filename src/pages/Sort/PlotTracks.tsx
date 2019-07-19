import React from 'react';
import Plot from 'react-plotly.js';
import Alert from 'react-bootstrap/Alert';
import { TrackWithAudioFeatures } from '../../models/Spotify';

interface IProps {
    tracks: TrackWithAudioFeatures[],
    selected_x_axis: string,
    selected_y_axis: string,
    selected_x_axis_min: number | undefined,
    selected_x_axis_max: number | undefined,
    selected_y_axis_min: number | undefined,
    selected_y_axis_max: number | undefined,
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
    const { tracks, selected_x_axis, selected_y_axis, selected_x_axis_name, selected_y_axis_name } = props;
    const { selected_x_axis_min, selected_x_axis_max, selected_y_axis_min, selected_y_axis_max } = props;

    const points: TrackPoint[] = tracks.map(t => {
        const track = {
            id: t.id,
            title: t.name,
            artist: t.artists.map(a => a.name).join(', '),
            length: t.duration_ms
        }

        if (t.audio_features !== undefined && t.audio_features !== null) {
            const x = (t.audio_features[(selected_x_axis as keyof SpotifyApi.AudioFeaturesObject)] as number);
            const y = (t.audio_features[(selected_y_axis as keyof SpotifyApi.AudioFeaturesObject)] as number);
            return { x: x, y: y, track: track }
        } else if (t.audio_features === undefined) { // Commonly occurs as t.audio_features === undefined on first playlist selection
            return { x: 0, y: 0, track: track }
        } else { // t.audio_features === null when no audio features could be found (ignore these then - we should not plot them)
            return null;
        }
    }).filter((sp): sp is TrackPoint => sp !== null);

    // Max and min points in the data
    const points_min_x: number = Math.min(...points.map(p => p.x));
    const points_min_y: number = Math.min(...points.map(p => p.y));
    const points_max_x: number = Math.max(...points.map(p => p.x));
    const points_max_y: number = Math.max(...points.map(p => p.y));

    // Mix expected and actual min's and max's to defined the colour gradient 
    const colour_x_min: number = selected_x_axis_min !== undefined ? Math.min(selected_x_axis_min, points_min_x) : points_min_x;
    const colour_x_max: number = selected_x_axis_max !== undefined ? Math.max(selected_x_axis_max, points_max_x) : points_max_x;
    const colour_y_min: number = selected_y_axis_min !== undefined ? Math.min(selected_y_axis_min, points_min_y) : points_min_y;
    const colour_y_max: number = selected_y_axis_max !== undefined ? Math.max(selected_y_axis_max, points_max_y) : points_max_y;

    // The min and max are passed in, but still take the points into account just incase there are values outside of the defined range
    const scale_x_min: number | undefined = selected_x_axis_min !== undefined ? Math.min(selected_x_axis_min, points_min_x) : undefined;
    const scale_x_max: number | undefined = selected_x_axis_max !== undefined ? Math.max(selected_x_axis_max, points_max_x) : undefined;
    const scale_y_min: number | undefined = selected_y_axis_min !== undefined ? Math.min(selected_y_axis_min, points_min_y) : undefined;
    const scale_y_max: number | undefined = selected_y_axis_max !== undefined ? Math.max(selected_y_axis_max, points_max_y) : undefined;

    return <>
        <Plot
            data={[{
                y: points.map(p => p.y),
                x: points.map(p => p.x),
                text: points.map(p => 'Title: ' + p.track.title + '<br>Artist: ' + p.track.artist + '<br>' + selected_x_axis_name + ': ' + p.x + '<br>' + selected_y_axis_name + ': ' + p.y),
                hoverinfo: "text",
                mode: "lines+markers",
                marker: {
                    size: 10,
                    color: points.map(p => {
                        let distanceAlongGradient = getDistancePercentageAlongLineTheOfClosestPointOnLineToAnArbitaryPoint({x: colour_x_min, y: colour_y_min}, {x: colour_x_max, y: colour_y_max}, {x: p.x, y: p.y});
                        return '#' + getPointAlongColourGradient('00529d', 'eb121b', distanceAlongGradient);
                    })
                },
                line: {
                    color: 'rgba(44, 48, 51, 0.5)',
                    width: 1
                }
            }]}
            layout={{ 
                hovermode: "closest", 
                margin: {t: 0, b: 0, l: 0, r: 0}, 
                plot_bgcolor: 'transparent', 
                paper_bgcolor: 'transparent',
                xaxis: {
                    range: [scale_x_min, scale_x_max]
                },
                yaxis: {
                    range: [scale_y_min, scale_y_max]
                }
            }}
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
        {tracks.filter(a => a.audio_features === null).length > 0 && <Alert variant="warning" className="mt-2 d-inline-block">
            Warning: Some songs are missing audio features.
            <br />Look in the table below to identify these songs (they will have no values beside them).
        </Alert>}
    </>
}

export default PlotTracks;
