import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Stopwatch = () => {
  // Stopwatch states
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  
  // CRUD states
  const [savedTimers, setSavedTimers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [timerName, setTimerName] = useState('');

  // Mock API URL (you can replace with a real API)
  const API_URL = 'https://mockapi.io/api/v1/timers';

  // Fetch all saved timers on component mount
  useEffect(() => {
    fetchTimers();
  }, []);

  // Stopwatch effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // API functions
  const fetchTimers = async () => {
    try {
      const response = await axios.get(API_URL);
      setSavedTimers(response.data);
    } catch (error) {
      console.error('Error fetching timers:', error);
    }
  };

  const createTimer = async () => {
    if (!timerName.trim()) return;
    
    try {
      const newTimer = {
        name: timerName,
        time: time,
        laps: laps,
        createdAt: new Date().toISOString()
      };
      
      await axios.post(API_URL, newTimer);
      setTimerName('');
      fetchTimers();
    } catch (error) {
      console.error('Error creating timer:', error);
    }
  };

  const updateTimer = async () => {
    if (!timerName.trim() || !editId) return;
    
    try {
      const updatedTimer = {
        name: timerName,
        time: time,
        laps: laps,
        updatedAt: new Date().toISOString()
      };
      
      await axios.put(`${API_URL}/${editId}`, updatedTimer);
      setEditId(null);
      setTimerName('');
      fetchTimers();
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  const deleteTimer = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTimers();
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  };

  // Stopwatch functions
  const startStopwatch = () => {
    setIsRunning(true);
  };

  const pauseStopwatch = () => {
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    setLaps([...laps, time]);
  };

  // Format time for display
  const formatTime = (timeInMs) => {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateTimer();
    } else {
      createTimer();
    }
  };

  const loadTimer = (timer) => {
    setTime(timer.time);
    setLaps(timer.laps || []);
    setTimerName(timer.name);
    setEditId(timer.id);
    setIsRunning(false);
  };

  return (
    <div className="stopwatch-container">
      <h1>Stopwatch</h1>
      
      <div className="stopwatch-display">
        {formatTime(time)}
      </div>
      
      <div className="stopwatch-controls">
        {!isRunning ? (
          <button onClick={startStopwatch}>Start</button>
        ) : (
          <button onClick={pauseStopwatch}>Pause</button>
        )}
        <button onClick={recordLap} disabled={!isRunning}>Lap</button>
        <button onClick={resetStopwatch}>Reset</button>
      </div>
      
      <div className="laps-section">
        <h3>Laps</h3>
        <ul>
          {laps.map((lap, index) => (
            <li key={index}>Lap {index + 1}: {formatTime(lap)}</li>
          ))}
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="save-form">
        <input
          type="text"
          value={timerName}
          onChange={(e) => setTimerName(e.target.value)}
          placeholder="Timer name"
          required
        />
        <button type="submit">{editId ? 'Update' : 'Save'} Timer</button>
        {editId && <button type="button" onClick={() => {
          setEditId(null);
          setTimerName('');
        }}>Cancel</button>}
      </form>
      
      <div className="saved-timers">
        <h3>Saved Timers</h3>
        <ul>
          {savedTimers.map(timer => (
            <li key={timer.id}>
              <span onClick={() => loadTimer(timer)} style={{cursor: 'pointer'}}>
                {timer.name} - {formatTime(timer.time)}
              </span>
              <button onClick={() => deleteTimer(timer.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stopwatch;
