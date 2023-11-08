export const getFormatedTime = (seconds:number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

// Pad the minutes and seconds with leading zeros, if required
    const minuteString = String(minutes).padStart(2, '0');
    const secondsString = String(remainingSeconds).padStart(2, '0');

    return minuteString + ":" + secondsString;
}