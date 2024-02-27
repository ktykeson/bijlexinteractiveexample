import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Match from './Match.jsx'; // Adjust the path as necessary based on your file structure
import { EquationsProvider } from './EquationsContext.jsx';
import { useEquations } from './EquationsContext.jsx';

function EnterEquations() {
  const navigate = useNavigate();
  const { equations, setEquations } = useEquations();

  const [equation, setEquation] = useState('');

  useEffect(() => {
    if (equations && equations.length > 0) {
      setEquation(equations.join('\n'));
    }
  }, [equations]);

  const handleSave = () => {
    const equationsArray = equation.split('\n').filter(eq => eq.trim() !== '');
    setEquations(equationsArray);
    alert('Equations saved: ' + equationsArray.join(', '));
  };

  // Function to generate a single random equation
  const generateRandomEquation = () => {
    const m = Math.floor(Math.random() * 21) - 10; // Random integer from -10 to 10
    const b = Math.floor(Math.random() * 21) - 10; // Random integer from -10 to 10
    // Determine the sign of b for correct equation formatting
    const sign = b < 0 ? "-" : "+";

    return `y=${m}x${sign}${Math.abs(b)}`;
  };

  // Function to append four new random equations to the textarea
  const handleGenerateEquations = () => {
    const newEquations = Array.from({ length: 4 }, generateRandomEquation).join('\n');
    setEquation(equation => equation + (equation ? '\n' : '') + newEquations);
  };

  return (
    <div>
      <h1>Enter Equations Page</h1>
      <div className="equation-input-container">
        <textarea
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="Type your equations here, one per line..."
          className="equation-input"
        ></textarea>
        <div className="buttons-container">
          <button onClick={handleSave} className="button-style">Save</button>
          <button onClick={handleGenerateEquations} className="button-style">Generate Equations</button>
          <button onClick={() => navigate(-1)} className="button-style">Go Back</button>
        </div>
      </div>
    </div>
  );
}

// Your MatchingExercise Component adjusted with navigation
function MatchingExercise() {
  const location = useLocation();
  const navigate = useNavigate(); // Make sure this is inside the component
  
  useEffect(() => {
    // Immediately redirect and reset the retry state if it's true
    if (location.state?.retry) {
      // Perform necessary actions before resetting retry, if any
      navigate('/match', { replace: true }); // Use replace to avoid navigation history with retry state
    }
  }, [location, navigate]);

  return (
    <div className="matching-exercise">
      <div className="content">
        <h1>Matching Exercise</h1>
        <p>by Tyke, Mustafa, and Ralu</p>
        <div className="buttons">
        <button onClick={() => navigate('/enter-equations')}>Enter Equations</button>
        <button onClick={() => navigate('/match')}>Go to Exercise</button>
        </div>
      </div>
    </div>
  );
}

// Your App Component with Routing
function App() {
  return (
    <EquationsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MatchingExercise />} />
          <Route path="/enter-equations" element={<EnterEquations />} />
          <Route path="/match" element={<Match />} />
        </Routes>
      </BrowserRouter>
    </EquationsProvider>
  );
}

export default App;
