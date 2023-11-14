import React, {useState, useEffect, useRef, useContext} from "react";
import styled from "styled-components";

import {VideoContext} from "../../context/VideoContext";
import {VideoContextType} from "../../context/Types";
// images
import TriangleIcon from '../../assets/traingle-icon.svg';

//#region Style Definitions
const TrimBarDiv = styled.div`
    position: relative;
    width: 80%;
    margin: auto;
`;

const SliderBackground = styled.div`
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    height: 80px;
    background: #000000;
`
const SliderStart = styled.div`
    width: 10px;
    height: 65px;
    border-radius: 10px 0 0 10px;
    background: #E2B425;
    cursor: ew-resize;
    z-index:1
`;

const SliderEnd = styled.div`
    width: 10px;
    height: 65px;
    border-radius: 0 10px 10px 0;
    background: #E2B425;
    cursor: ew-resize;
    z-index:1 
`;
const SliderEmpty = styled.div`
  height: 80px;
  background: black;
  opacity: 0.7;
  z-index:1 
`;

const SliderCenter = styled.div`
  height: 60px;
  border: 3px solid #E2B425;
  z-index:1 
`;
const VideoImages = styled.div`
    position: absolute;
    height: 80px;
    width: 100%;
    top: 10px;
    opacity: 0.8;
    z-index: 0;
`;
const VideoProgressCursor = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    height: 80px;
    width:100%;
`;
const VideoProgressCursorGroup = styled.div`
    display: flex;
    flex-direction: column;
`;
const VideoProgressCursorIcon = styled.img`
    position: relative;
    left: -6px;
    height: 15px;
    z-index: 5;
    cursor: pointer;
    transform: rotate(180deg);
`;
const VideoProgressCursorLine = styled.div`
    position: relative;
    width: 3px;
    height: 60px;
    background: white;
    cursor: pointer;
    z-index: 5;
`;

//#endregion

function TrimBar( props: {
    trimStart: number,
    trimEnd: number,
    setTrimStart: (arg0: number) => void,
    setTrimEnd: (arg0: number) => void,
    currentTime: number,
    setCurrentTime: (arg0: number) => void,
}){
    //#region Properties
    const videoProgressRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<string>('');
    const [currentPosition, setCurrentPosition] = useState(0);
    const [movement, setMovement] = useState(0);
    const { imagePath, videoDuration } = useContext(VideoContext) as VideoContextType;
    //#endregion

    //#region lifecycle
    useEffect(() => {
        const mouseMoveListener = (e:MouseEvent) => {
            e.stopPropagation();
            if (dragging) {
                updateTrim(e, dragging);
            }
        };

        const mouseUpListener = () => {
            setDragging('');
        };

        window.addEventListener("mousemove", mouseMoveListener);
        window.addEventListener("mouseup", mouseUpListener);

        return () => {
            window.removeEventListener("mousemove", mouseMoveListener);
            window.removeEventListener("mouseup", mouseUpListener);
        };
    }, [dragging]);

    //#endregion

    //#region Methods

    const getRelativePosition = (e:MouseEvent, element:HTMLDivElement) => {
        const rect = element.getBoundingClientRect();
        return e.clientX - rect.left;
    };

    const updateTrim = (e:MouseEvent, position:string) => {
        const videoProgress:HTMLDivElement | null = videoProgressRef.current;
        if (videoProgress) {
            const newTime =
                (getRelativePosition(e, videoProgress) / videoProgress.offsetWidth) *
                videoDuration;
            setMovement(newTime - currentPosition);
            setCurrentPosition(newTime);
            switch (position) {
                case 'start':
                    props.setTrimStart(newTime);
                    break;
                case 'end':
                    props.setTrimEnd(newTime);
                    break;
                case 'both':
                    props.setTrimStart(props.trimStart + movement);
                    props.setTrimEnd(props.trimEnd + movement);
                    break;
                case 'cursor':
                    if (newTime < props.trimEnd && newTime > props.trimStart) {
                        props.setCurrentTime(newTime);
                    }
                    break;
                default:
                    break;
            }
        }
    };

    //#endregion

    return (
        <TrimBarDiv>
            <SliderBackground id="videoProgress" ref={videoProgressRef}>
                <SliderEmpty style={{width: `${(props.trimStart / videoDuration) * 100}%`}}></SliderEmpty>
                <SliderStart onMouseDown={() => setDragging("start")}/>
                <SliderCenter
                     style={{width: `${((props.trimEnd - props.trimStart) / videoDuration) * 100}%`}}
                     onMouseDown={() => setDragging("both")}
                >
                </SliderCenter>
                <SliderEnd  onMouseDown={() => setDragging("end")}/>
                <SliderEmpty
                     style={{width: `${((videoDuration - props.trimEnd) / videoDuration) * 100}%`}}
                ></SliderEmpty>
            </SliderBackground>
            <VideoProgressCursor id="videoProgressCursor" >
                <div
                     style={{paddingRight: `${(props.currentTime/videoDuration)*100}%`}}>
                </div>
                <VideoProgressCursorGroup onMouseDown={() => setDragging("cursor")} >
                    <VideoProgressCursorIcon alt="timeLineController" src={TriangleIcon}/>
                    <VideoProgressCursorLine />
                </VideoProgressCursorGroup>
            </VideoProgressCursor>
            <VideoImages >
                {imagePath && imagePath.map((imgUrl:string, index:number) =>{
                    return <img alt="videoImages" src={imgUrl} key={index} style={{width:`${100 / imagePath.length}%`, maxHeight: '60px', aspectRatio: 1}} draggable={false}/>
                })}
            </VideoImages>
        </TrimBarDiv>

    );
}

export default TrimBar;
