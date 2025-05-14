import GalaxyScene from './GalaxyScene';
import React, { useState, useEffect } from 'react';
import Loader3D from './components/Loader3D.jsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (loading) {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 2) + 1;
        if (current >= 100) {
          current = 100;
          setProgress(current);
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 200);
        } else {
          setProgress(current);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  if (loading) {
    return <Loader3D progress={progress} fadeOut={fadeOut} />;
  }

  return (
    <div className="App">
      <GalaxyScene />
    </div>
  );
}

export default App;
