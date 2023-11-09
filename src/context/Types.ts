export type VideoContextType = {
    imagePath: string[];
    setImagePath: (todo: string[]) => void;
    videoDuration: number;
    setVideoDuration: (value: number) => void;
};