import * as React from 'react';
import {createContext, useState} from "react";
import {VideoContextType} from "./Types";

export const VideoContext = createContext<VideoContextType | null>(null);

interface Props {
    children: React.ReactNode;
}
const TodoProvider: React.FC<Props> = ({ children }) => {
    const [imagePath, setImagePath] = useState<string[]>([]);
    const [videoDuration, setVideoDuration] = useState(0);
    return (
        <VideoContext.Provider value={{
            imagePath,
            setImagePath,
            videoDuration,
            setVideoDuration
        }}>
            {children}
        </VideoContext.Provider>);
};

export default TodoProvider;

