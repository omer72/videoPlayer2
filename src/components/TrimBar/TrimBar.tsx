import React, {useState, useEffect, useRef} from "react";
import TriangleIcon from './traingle-icon.svg';
import styled from "styled-components";

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
function TrimBar( props: {
    videoDuration: number,
    trimStart: number,
    trimEnd: number,
    setTrimStart: (arg0: number) => void,
    setTrimEnd: (arg0: number) => void,
    currentTime: number,
    setCurrentTime: (arg0: number) => void,
    imagePath: string[]
}){
    const videoProgressRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<string>('');
    const [currentPosition, setCurrentPosition] = useState(0);
    const [movement, setMovement] = useState(0);

    const getRelativePosition = (e:MouseEvent, element:HTMLDivElement) => {
        const rect = element.getBoundingClientRect();
        return e.clientX - rect.left;
    };

    const updateTrim = (e:MouseEvent, position:string) => {
        const videoProgress:HTMLDivElement | null = videoProgressRef.current;
        if (videoProgress) {
            const newTime =
                (getRelativePosition(e, videoProgress) / videoProgress.offsetWidth) *
                props.videoDuration;
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
    }, [dragging, updateTrim]);

    return (
        <TrimBarDiv>
            <SliderBackground id="videoProgress" ref={videoProgressRef}>
                <SliderEmpty style={{width: `${(props.trimStart / props.videoDuration) * 100}%`}}></SliderEmpty>
                <SliderStart onMouseDown={() => setDragging("start")}/>
                <SliderCenter
                     style={{width: `${((props.trimEnd - props.trimStart) / props.videoDuration) * 100}%`}}
                     onMouseDown={() => setDragging("both")}
                >
                </SliderCenter>
                <SliderEnd  onMouseDown={() => setDragging("end")}/>
                <SliderEmpty
                     style={{width: `${((props.videoDuration - props.trimEnd) / props.videoDuration) * 100}%`}}
                ></SliderEmpty>
            </SliderBackground>
            <VideoProgressCursor id="videoProgressCursor" >
                <div
                     style={{paddingRight: `${(props.currentTime/props.videoDuration)*100}%`}}>
                </div>
                <VideoProgressCursorGroup onMouseDown={() => setDragging("cursor")} >
                    <VideoProgressCursorIcon alt="timeLineController" src={TriangleIcon}/>
                    <VideoProgressCursorLine />
                </VideoProgressCursorGroup>
            </VideoProgressCursor>
            <VideoImages >
                {props.imagePath.map((imgUrl:string, index:number) =>{
                    return <img alt="videoImages" src={imgUrl} key={index} style={{width:`${100 / props.imagePath.length}%`}} draggable={false}/>
                })}
            </VideoImages>
        </TrimBarDiv>

    );
};

export default TrimBar;
