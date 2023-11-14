import {ChangeEvent, useEffect, useRef, useState} from "react";
import styled from "styled-components";

import TrimBar from "../TrimBar/TrimBar";
import {getFormatedTime} from "../../utils";
// Images
import PlayIcon from '../../assets/play_icon.svg';
import PauseIcon from '../../assets/pause_icon.svg';


//#region Style Definitions
const VideoElement = styled.div`
  display:flex;
  justify-content:center
`;
const VideoWindow = styled.div`
    display: flex;
    height: 80vh;
    flex-direction: column;
    background-color: black;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20px;
`;
const VideoCtrl  = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-around;
`;

const VideoControl = styled.img`
    width:20px;
`;

const VideoLabel = styled.label`
    color: white;
`;

const VideoTag = styled.video`
  padding: 20px;
  max-height: 80%;
`;
//#endregion

function VideoEditor(){

    //#region Properties
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [imagePath, setImagePath] = useState<string[]>([]);
    const [showTime, setShowTime] = useState('--:--');
    const [isPlaying, setIsPlaying] = useState(true);
    const trimEndRef = useRef(trimEnd);
    //#endregion

    //#region Lifecycle

    // Update the ref value whenever count changes
    useEffect(() => {
        trimEndRef.current = trimEnd;
    }, [trimEnd]);

    useEffect(() => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video) {
            video.addEventListener("loadedmetadata", function () {
                setVideoDuration(video.duration);
                setTrimEnd(video.duration);
                setShowTime(getFormatedTime(video.currentTime) + "/" + getFormatedTime(video.duration));

            });
            video.addEventListener("timeupdate", function () {
                setShowTime(getFormatedTime(video.currentTime) + "/" + getFormatedTime(video.duration));
                if (video.currentTime > trimEndRef.current) {
                    video.pause();
                }
            });
        }
    }, []);
    //#endregion

    //#region Methods
    const updateStartTime = (value:number) => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video && video.currentTime < value){
            video.currentTime = value;
        }
        setTrimStart(value);
    }

    const updateEndTime = (value:number) => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video && video.currentTime > value){
            video.currentTime = value;
        }
        setTrimEnd(value);
    }

    const updateCurrentTime = (value:number) => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video){
            video.currentTime = value;
        }
    }

    // Function for creating a thumbnail images from video
    function captureVideoThumbnails(videoUrl:string, imageCount:number):Promise<string[]> {
        return new Promise((resolve, reject) => {
            let video = document.createElement('video');
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            let thumbnails:string[] = [];
            let jumps = 0;
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = 0;
                jumps = video.duration / imageCount ;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            });


            video.addEventListener('seeked', () => {
                // Create the thumbnail
                if (context) context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                let thumbnail = canvas.toDataURL('image/jpeg');
                thumbnails.push(thumbnail);

                // Seek to the next interval or resolve the promise
                if (video.currentTime + jumps <= video.duration) {
                    video.currentTime += jumps;
                } else {
                    resolve(thumbnails);
                }
            });

            video.addEventListener('error', () => {
                reject("Error when loading video");
            });

            video.src = videoUrl;
            video.load();
        });
    }

    // load the video from file path
    const loadVideo = (e:ChangeEvent<HTMLInputElement>) =>{
        setImagePath([]);
        const file = e.target.files;
        if (file && file.length) {
            const url = URL.createObjectURL(file[0]);
            const video: HTMLVideoElement | null = videoRef.current;
            if (video) {
                video.src = url;
                captureVideoThumbnails(url, 10).then(dataUrl => {
                    // This is a base64 string of the first frame of the video.
                    // You can use this as the src attribute of an img element, save it to a server, etc.
                    setImagePath(dataUrl);
                });
                setTrimStart(0);
                setTrimEnd(video.duration);
            }
        }
    }

    // handle the play video process.
    const playVideo = () => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video && !isPlaying){
            video.pause();
            setIsPlaying(!isPlaying);
        // in case the video is in the end of the time range, pause the video
        } else  if (video && video.currentTime < trimEnd) {
            video.play();
            setIsPlaying(!isPlaying);
        }

    }
    //#endregion

    return (
        <>
            <input type="file" onChange={loadVideo} accept="video/*" />
            <VideoElement>
                <VideoWindow>
                    <VideoTag ref={videoRef} className="video" controls={false} />
                    <VideoCtrl>
                        <VideoControl alt='controller' src={isPlaying ? PlayIcon : PauseIcon} onClick={playVideo}/>
                        <VideoLabel>{showTime}</VideoLabel>
                    </VideoCtrl>
                </VideoWindow>
            </VideoElement>
            <TrimBar
                videoDuration={videoDuration}
                trimStart={trimStart}
                trimEnd={trimEnd}
                setTrimStart={updateStartTime}
                setTrimEnd={updateEndTime}
                currentTime={videoRef.current != null ? videoRef.current.currentTime: 0}
                setCurrentTime={updateCurrentTime}
                imagePath={imagePath}
            />
        </>
    )
}

 export default VideoEditor;