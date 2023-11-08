import TrimBar from "../TrimBar/TrimBar";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {getFormatedTime} from "../../utils";
import TriangleIcon from '../TrimBar/traingle-icon.svg';
import styled from "styled-components";

const VideoElement = styled.div`
  display:flex;
  justify-content:center
`;
const VideoWindow = styled.div`
    display: flex;
    height: 80vh;
    flex-direction: column;
    background-color: black;
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
    transform: rotate(90deg);
`;

const VideoLabel = styled.label`
    color: white;
`;

function VideoEditor(){

    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [imagePath, setImagePath] = useState<string[]>([]);
    const [showTime, setShowTime] = useState('--:--');
    const [isPlaying, setIsPlaying] = useState(false);
    const trimEndRef = useRef(trimEnd);

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
            });
            video.addEventListener("timeupdate", function () {
                setShowTime(getFormatedTime(video.currentTime) + "/" + getFormatedTime(video.duration));
                if (video.currentTime > trimEndRef.current) {
                    video.pause();
                }
            });
        }
    }, []);


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


    const loadVideo = (e:ChangeEvent<HTMLInputElement>) =>{
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
            }
        }
    }

    const playVideo = () => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video && !isPlaying){
            video.pause();
            setIsPlaying(!isPlaying);
        } else  if (video && video.currentTime < trimEnd) {
            video.play();
            setIsPlaying(!isPlaying);
        }

    }


    return (
        <div>
            <input type="file" onChange={loadVideo} accept="video/*" /><br/>
            <VideoElement>
                <VideoWindow>
                    <video ref={videoRef} className="video" controls={false} />
                    <VideoCtrl>
                        <VideoControl alt='controller' src={TriangleIcon} onClick={playVideo}/>
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
        </div>
    )
}

 export default VideoEditor;