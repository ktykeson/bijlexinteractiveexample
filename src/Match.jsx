import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from 'react-router-dom';
import { useEquations } from './EquationsContext';

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

  const generateRandomEquations = () => {
    let newEquations = [];
    for (let i = 0; i < 4; i++) {
      const m = Math.round(Math.random() * 10 - 5);
      const b = Math.round(Math.random() * 20 - 10);
      newEquations.push({ m, b, id: i });
    }
    setEquations(newEquations);
    setShuffledEquations(shuffleArray([...newEquations]));
  };

  useEffect(() => {
    if (contextEquations.length > 0) {
      // Shuffle contextEquations if there are more than 4, then take the first 4
      const shuffledEquations = shuffleArray([...contextEquations]); // Copy to avoid mutating the original array
      const selectedEquations = shuffledEquations.length > 4 ? shuffledEquations.slice(0, 4) : shuffledEquations;
  
      // Convert them to your expected format here before setting them
      const formattedEquations = selectedEquations.map((eq, index) => {
        const parts = eq.replace('y=', '').split('x');
        const m = parseFloat(parts[0]);
        const b = parseFloat(parts[1]);
        return { m, b, id: index };
      });
  
      setEquations(formattedEquations);
      setShuffledEquations(shuffleArray([...formattedEquations]));

      setMessage('Verbind de vergelijkingen met de grafieken hieronder.');
    } else {
      alert('Geen vergelijkingen opgeslagen');
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
    const data = {
      labels: Array.from({ length: 21 }, (_, i) => i - 10),
      datasets: [
        {
          label: `Line ${index + 1}`,
          data: Array.from({ length: 21 }, (_, i) => equation.m * (i - 10) + equation.b),
          borderColor,
          borderWidth: 2,
        },
      ],
    };

    const options = {
      scales: {
        y: {
          min: -10,
          max: 10,
        },
        x: {
          min: -10,
          max: 10,
        },
      },
      onClick: () => handleGraphClick(index),
    };

    return <Line data={data} options={options} />;
  };

  return (
    <div>
      {message && <div style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>{message}</div>}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {equations.map((equation, index) => (
          <div key={index}>{renderGraph(equation, index)}</div>
        ))}
      </div>
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "20px" }}>
        {shuffledEquations.map((equation, index) => {
          // Determine the sign and format the equation string accordingly
          const sign = equation.b < 0 ? "-" : "+";
          return (
            <button
              key={index}
              style={{ background: highlightedButtons[index] ? colors[index % colors.length] : "" }}
              onClick={() => selectEquationForMatching(index)}
            >
              {/* Updated to include correct sign logic */}
              y = {equation.m}x {sign} {Math.abs(equation.b)}
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
