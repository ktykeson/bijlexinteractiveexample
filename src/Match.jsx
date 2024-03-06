import { useState, useEffect } from "react";
import { Chart, registerables } from 'chart.js';
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from 'react-router-dom';
import { useEquations } from './EquationsContext';

Chart.register(...registerables);

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};

const Match = () => {
  const navigate = useNavigate();
  const { equations: contextEquations } = useEquations(); // Get equations from context
  const [shuffledEquations, setShuffledEquations] = useState([]);
  const [equations, setEquations] = useState([]);
  const [matches, setMatches] = useState(new Array(4).fill(null));
  const [selectedEquationIndex, setSelectedEquationIndex] = useState(null);
  const [selectedColors, setSelectedColors] = useState(new Array(4).fill(null));
  const [highlightedButtons, setHighlightedButtons] = useState(new Array(4).fill(false)); // Track button highlighting state
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("Stuur");
  const [retry, setRetry] = useState(false);

  const colors = ["red", "blue", "orange", "green"];

  useEffect(() => {
    if (contextEquations.length > 0) {
      const shuffledEquations = shuffleArray([...contextEquations]);
      const selectedEquations = shuffledEquations.length > 4 ? shuffledEquations.slice(0, 4) : shuffledEquations;
  
      const formattedEquations = selectedEquations.map((eq, index) => {
        const parts = eq.split('=');
        if (parts.length !== 2) return null; // Basic validation to ensure equation format is correct
        const variable = parts[0].trim();
        const expression = parts[1].trim();
        const match = expression.match(/([-+]?[0-9]*\.?[0-9]+)([a-zA-Z])+([-+]?[0-9]+)/);
        const quadraticMatch = expression.match(/([-+]?[0-9]*\.?[0-9]+)\((\w)([-+][0-9]+)\)\^2\s*([-+]?[0-9]+)/);
      
        if (quadraticMatch) {
          const a = parseFloat(quadraticMatch[1]);
          const quadvariable = quadraticMatch[2];
          const dependentVariable = parts[0].trim()[0];
          const h = parseFloat(quadraticMatch[3]);
          const k = parseFloat(quadraticMatch[4]);
          return { a, h, k, id: index, quadvariable, dependentVariable, type: 'quadratic' };
        }
        else if (match) {
          const m = parseFloat(match[1]);
          const dependentVariable = match[2];
          const b = parseFloat(match[3]);
          return { m, b, id: index, variable, dependentVariable };
        }
        return null; // Handle invalid equation formats if needed
      }).filter(eq => eq !== null); // Remove any nulls that were added due to invalid formats
  
      setEquations(formattedEquations);
      setShuffledEquations(shuffleArray([...formattedEquations]));
  
      setMessage('Verbind de vergelijkingen met de grafieken hieronder.');
    } else {
      alert('No Saved Equations Found.');
      navigate('/');
    }
  }, [contextEquations, navigate]);
  

  const selectEquationForMatching = (index) => {
    const newHighlightedButtons = [...highlightedButtons];
    
    // Check if another button was previously selected but not matched
    if (selectedEquationIndex !== null && selectedEquationIndex !== index && !selectedColors.includes(selectedEquationIndex)) {
      // Deselect the previously selected but unmatched button
      newHighlightedButtons[selectedEquationIndex] = false;
    }
  
    newHighlightedButtons[index] = !newHighlightedButtons[index];
    setHighlightedButtons(newHighlightedButtons);
  
    const alreadyHighlighted = highlightedButtons[index];
  
    if (alreadyHighlighted) {
      // Deselect and clear color if already highlighted
      setSelectedColors(selectedColors.map((color, idx) => color === index ? null : color));
      //setSelectedEquationIndex(null);
      matches[selectedEquationIndex] = null;
      if (selectedEquationIndex === index) {
        setSelectedEquationIndex(null); // Allow reselection by clearing the selected index
      }
      else if (selectedEquationIndex === null) {
        setSelectedEquationIndex(index);
      }
    } 
    else {
      // Update the selected equation index directly without resetting other selections
      setSelectedEquationIndex(index);
    }
  };

  const handleGraphClick = (graphIndex) => {
    // Check if a button is selected, not already matched with a color, and the graph does not already have a color matched
    if (selectedEquationIndex !== null && !selectedColors.includes(selectedEquationIndex) && selectedColors[graphIndex] === null) {
      const newMatches = [...matches];
      // Prevent reassignment if already matched with a color
      if (!newMatches.includes(shuffledEquations[selectedEquationIndex])) {
        newMatches[graphIndex] = shuffledEquations[selectedEquationIndex];
        setMatches(newMatches);

        const newSelectedColors = [...selectedColors];
        newSelectedColors[graphIndex] = selectedEquationIndex;
        setSelectedColors(newSelectedColors);
  
        // Optionally, can also clear the selectedEquationIndex here if the selection is to be an one-time action
        //setSelectedEquationIndex(index);
        //setHighlightedButtons(highlightedButtons.map((highlighted, index) => index === selectedEquationIndex ? false : highlighted));
      }
    }
  };

  const handleSubmit = () => {
    const isCorrect = matches.every((match, index) => match && match.id === index);
    setMessage(isCorrect ? "Klopt!" : "Onjuist. Probeer het opnieuw!");

    // Change the button text to "Try Again" after submission
    if (isCorrect || !isCorrect) {
      setButtonText("Opnieuw proberen");
    }
  };

  const handleTryAgain = () => {
    if (buttonText === "Opnieuw proberen") {
      navigate('/', { state: { retry: true } });
    } else {
      handleSubmit(); // If not in "Try Again" state, perform the original submit behavior
    }
  };
  

  const renderGraph = (equation, index) => {
    const borderColor = selectedColors[index] !== null ? colors[selectedColors[index] % colors.length] : "rgba(75,192,192,1)";

    let data, options;

    if (equation.type === 'quadratic') {
        data = {
            labels: Array.from({ length: 41 }, (_, i) => i - 20),
            datasets: [{
                label: `Parabola: ${index + 1}`,
                data: Array.from({ length: 41 }, (_, i) => {
                    let x = i - 20;
                    return equation.a * Math.pow(x - equation.h, 2) + equation.k;
                }),
                borderColor,
                borderWidth: 2,
            }],
        };
  
        options = {
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: -10,
                    suggestedMax: 10,
                    grid: {
                        color: (context) => context.tick.value === 0 ? 'black' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
                    },
                    ticks: {
                        color: 'black',
                    },
                },
                x: {
                    min: -20,
                    max: 20,
                    grid: {
                        color: (context) => context.tick.value === (20) ? 'black' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: (context) => context.tick.value === (20) ? 2 : 1,
                    },
                    ticks: {
                        color: 'black',
                        // Include a stepSize or use 'autoSkip: false' to ensure a tick at zero is included.
                        // Adjust stepSize or autoSkip as necessary based on your data.
                    },
                },
            },
            onClick: () => handleGraphClick(index),
        };
    } else {
        data = {
            labels: Array.from({ length: 21 }, (_, i) => i - 10),
            datasets: [{
                label: `Line ${index + 1}`,
                data: Array.from({ length: 21 }, (_, i) => equation.m * (i - 10) + equation.b),
                borderColor,
                borderWidth: 2,
            }],
        };
  
        options = {
            scales: {
                y: {
                    min: -10,
                    max: 10,
                    grid: {
                        color: (context) => context.tick.value === 0 ? 'black' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
                    },
                    ticks: {
                        color: 'black',
                    },
                },
                x: {
                    min: -10,
                    max: 10,
                    grid: {
                      color: (context) => context.tick.value === (10) ? 'black' : 'rgba(0, 0, 0, 0.1)',
                      lineWidth: (context) => context.tick.value === (10) ? 2 : 1,
                    },
                    ticks: {
                        color: 'black',
                        // Include a stepSize or use 'autoSkip: false' to ensure a tick at zero is included.
                        // Adjust stepSize or autoSkip as necessary based on your data.
                    },
                },
            },
            onClick: () => handleGraphClick(index),
        };
    }

    return (
        <div style={{ width: '700px', height: '300px' }}> {/* Adjust the size as needed */}
            <Line data={data} options={options} />
        </div>
    );
};



return (
  <div>
      {message && <div style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>{message}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
          {equations.map((equation, index) => (
              <div key={index} style={{ width: 'calc(50% - 20px)', display: 'flex', justifyContent: 'center', marginBottom: "20px" }}>
                  {renderGraph(equation, index)}
              </div>
          ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}> {/* Reduced gap to make buttons closer */}
          {shuffledEquations.map((equation, index) => {
              let equationText;
              if (equation.type === 'quadratic') {
                  const hDisplay = equation.h > 0 ? `+ ${equation.h}` : `- ${Math.abs(equation.h)}`;
                  const kDisplay = equation.k >= 0 ? `+ ${equation.k}` : `${equation.k}`;
                  equationText = `${equation.dependentVariable} = ${equation.a}(${equation.quadvariable} ${hDisplay})^2 ${kDisplay}`;
              } else {
                  const sign = equation.b < 0 ? "-" : "+";
                  equationText = `${equation.variable} = ${equation.m}${equation.dependentVariable} ${sign} ${Math.abs(equation.b)}`;
              }
              return (
                  <button
                      key={index}
                      style={{ background: highlightedButtons[index] ? colors[index % colors.length] : "", padding: "10px", display: "inline-block" }} // Adjust button styling here if needed
                      onClick={() => selectEquationForMatching(index)}
                  >
                      {equationText}
                  </button>
              );
          })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
          <button onClick={handleTryAgain} disabled={matches.includes(null)}>{buttonText}</button>
          <button onClick={() => navigate(-1)}>Terug</button>
      </div>
  </div>
);

};

export default Match;
