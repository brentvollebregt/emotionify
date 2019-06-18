import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useTitle } from 'hookrouter';

interface IProps { }

const About: React.FunctionComponent<IProps> = (props: IProps) => {
    useTitle('Emotionify - About');

    return <Container>
        <Row className="justify-content-md-center">
            <Col className="col-md-10 col-lg-8">
                <h1 className="text-center">About</h1>
                <p>Emotionify is application I had though about for a few years after doing a project at university on attempting to detect emotion in music and portraying it in an interactive environment.</p>
                <p>By default, chosing a playlist on the Sort page will sort your music by <code>Valence</code> and <code>Energy</code> which are <a href="https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/">audio features calculated by Spotify</a>. When conducting research for my project, this is was the some of the best public and easily accessible data that related to emotion in music. Also with Spotify being so large and active among many people, it allows for people to easily organise thier own playlists.</p>
                <p>Emotionify is not 100% accurate as emotion is highly opinion based and the values used to sort songs are averages over the whole song. This tool however does give insight on how well a computer can plot an emotional gradient with a list of songs.</p>
                <p>I made this project because I was curious if this data really did mean anything and if my guess of the data being able to be used to sort playlists by emotion was correct. I can leave that up to you to decide!</p>
                <p>As you can see on the Sort page, I have also made the other audio features avaiable for you to play around with.</p>

                <h2 className="text-center">Stored Data</h2>
                <p>I am fully tranparent with the data that is stored here and what is done with it. None of your data is sent off this site and when stored, it stored in local storage.</p>
                <p>To view a summary of the stored data, simply click your name in the top right. To clear this data, simply logout using the same dialog that appears.</p>

                <h2 className="text-center">FAQ</h2>
                <h5>Why is this a thing?</h5>
                <p>I was curious.</p>
                <h5>Will this remove duplicates?</h5>
                <p>Yes, if this tool didn't then the duplicate songs would be bunched up by each other. Removing these allows for proper transitions into a different song.</p>
                <h5>How do I clear all my data?</h5>
                <p>All data is stored in localStorage on your machine; simply logging out will clear all this data.</p>
                <h5>What are each of the audio features I select for the axis?</h5>
                <p>Here are some summaries from <a href="https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/">Spotify</a>:</p>
                <ul>
                    <li><code>Acousticness</code>: A confidence measure from 0 to 1 of whether the track is acoustic. 1 represents high confidence the track is acoustic.</li>
                    <li><code>Danceability</code>: Danceability describes how suitable a track is for dancing based on a combination of musical elements. A value of 0 is least danceable and 1 is most danceable.</li>
                    <li><code>Duration</code>: The duration of the track in milliseconds.</li>
                    <li><code>Energy</code>: Energy is a measure from 0 to 1 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale.</li>
                    <li><code>Instrumentalness</code>: Predicts whether a track contains no vocals. The closer the instrumentalness value is to 1, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.</li>
                    <li><code>Key</code>: The estimated overall key of the track. (-1 if no key is detected)</li>
                    <li><code>Liveness</code>: Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.</li>
                    <li><code>Loudness</code>: The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Values typical range between -60 and 0 db.</li>
                    <li><code>Mode</code>: Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.</li>
                    <li><code>Speechiness</code>: Speechiness detects the presence of spoken words in a track. Talk shows and audio books are closer to 1, songs made entirely of spoken words are above 0.66, songs that contain both music and speech are typically around 0.33 - 0.66 and values below 0.33 represent music and other non-speech-like tracks.</li>
                    <li><code>Tempo</code>: The overall estimated tempo of a track in beats per minute (BPM).</li>
                    <li><code>Time Signature</code>: An estimated overall time signature of a track. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure).</li>
                    <li><code>Valence</code>: A measure from 0 to 1 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive, while tracks with low valence sound more negative.</li>
                </ul>
            </Col>
        </Row>
    </Container>
}

export default About;
