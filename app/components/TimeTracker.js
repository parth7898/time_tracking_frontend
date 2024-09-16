"use client"; // Ensure this is a client component

import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

const TimeTracker = () => {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isTracking, setIsTracking] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [inactive, setInactive] = useState(false); // Track inactivity
  const [inactivityTimeout, setInactivityTimeout] = useState(60 * 1000); // 1 minute in milliseconds
  const intervalRef = useRef(null);
  const inactivityRef = useRef(null);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const totalElapsedSeconds = Math.floor((currentTime - startTime + pausedTime) / 1000);

        const hours = Math.floor(totalElapsedSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalElapsedSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalElapsedSeconds % 60).toString().padStart(2, '0');

        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);

      // Set up inactivity detection
      const resetInactivityTimer = () => {
        setInactive(false);
        clearTimeout(inactivityRef.current);
        inactivityRef.current = setTimeout(() => {
          setInactive(true);
          takeScreenshot(); // Function to take a screenshot
          showNotification(); // Function to show a notification
        }, inactivityTimeout);
      };

      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keypress', resetInactivityTimer);
      resetInactivityTimer(); // Start the timer initially

      return () => {
        clearInterval(intervalRef.current);
        clearTimeout(inactivityRef.current);
        window.removeEventListener('mousemove', resetInactivityTimer);
        window.removeEventListener('keypress', resetInactivityTimer);
      };
    } else {
      clearInterval(intervalRef.current);
      clearTimeout(inactivityRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isTracking, startTime, pausedTime]);

  const startTracking = () => {
    if (!isTracking) {
      setStartTime(Date.now());
      setIsTracking(true);
    }
  };

  const stopTracking = () => {
    if (isTracking) {
      setPausedTime((prev) => prev + (Date.now() - startTime));
      setIsTracking(false);
    }
  };

  const takeScreenshot = () => {
    const element = document.body; // or a specific element

    html2canvas(element)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        console.log('Screenshot taken:', imgData);

        // Create a download link and trigger it
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'screenshot.png';
        link.click();
      })
      .catch(error => {
        console.error('Error taking screenshot:', error);
      });
    };

  const showNotification = () => {
    // Use Notification API to show pop-up notifications
    if (Notification.permission === 'granted') {
      new Notification('Inactivity detected', { body: 'You have been inactive for a while.' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Inactivity detected', { body: 'You have been inactive for a while.' });
        }
      });
    }
  };

  return (
    <div style={styles.container}>
      <h1>Time Tracker</h1>
      <div style={styles.buttons}>
        <button
          onClick={startTracking}
          style={styles.button}
        >
          Start Tracking
        </button>
        <button
          onClick={stopTracking}
          style={styles.button}
          disabled={!isTracking}
        >
          Stop Tracking
        </button>
      </div>
      <div style={styles.result}>
        <p>Elapsed Time: {elapsedTime}</p>
        {inactive && <p style={styles.inactiveWarning}>Inactivity detected. Screenshot taken.</p>}
      </div>
    </div>
  );
};

// Inline styles for basic styling
const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    color: '#333'
  },
  buttons: {
    margin: '20px 0',
  },
  button: {
    margin: '0 10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#005bb5',
  },
  result: {
    marginTop: '20px',
    color: '#333',
  },
  inactiveWarning: {
    color: 'red', // Highlight the inactivity warning
    marginTop: '10px',
  },
};

export default TimeTracker;
