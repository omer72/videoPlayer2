import React from 'react';
import VideoEditor from "./components/VideoEditor/VideoEditor";
import VideoProvider from "./context/VideoContext"
function App() {

  return (
      <VideoProvider>
        <VideoEditor/>
      </VideoProvider>
  );
}

export default App;
