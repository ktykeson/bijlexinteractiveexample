import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";
import Popup from "./Popup";

// Constants for rotation
const graphRange = 10;
function App() {
	const [lineParams, setLineParams] = useState({ m: 1, b: 0 });
	const [equation, setEquation] = useState("");
	const [targetEquation, setTargetEquation] = useState({ m: 0, b: 0 });
	const [showEquation, setShowEquation] = useState(true);
	const [showPopup, setShowPopup] = useState(false);
	const [popupMessage, setPopupMessage] = useState(true);
	const moveLine = (direction) => {
		setLineParams((prevParams) => {
			let { m, b } = prevParams;
			switch (direction) {
				case "up":
					b += 1;
					break;
				case "down":
					b -= 1;
					break;
				case "left":
					m -= 0.5;
					break;
				case "right":
					m += 0.5;
					break;
				default:
					break;
			}
			console.log(`m : ${m}`);
			console.log(`b : ${b}`);
			return { ...prevParams, m, b };
		});
	};

	// Prepare data for the chart
	const data = {
		labels: Array.from(
			{ length: graphRange * 2 + 1 },
			(_, i) => i - graphRange,
		),
		datasets: [
			{
				label: "Line",
				data: Array.from(
					{ length: graphRange * 2 + 1 },
					(_, i) => lineParams.m * (i - graphRange) + lineParams.b,
				),
				borderColor: "purple",
				borderWidth: 2,
			},
		],
	};

	// Prepare options for the chart to include rotation
	const options = {
		scales: {
			y: {
				type: "linear",
				position: "center",
				min: -graphRange,
				max: graphRange,
				grid: {
					display: true,
					drawBorder: true,
					drawOnChartArea: true,
					drawTicks: true,
				},
				ticks: {
					stepSize: 1,
				},
			},
			x: {
				type: "linear",
				position: "center",
				min: -graphRange,
				max: graphRange,
				grid: {
					display: true,
					drawBorder: true,
					drawOnChartArea: true,
					drawTicks: true,
				},
				ticks: {
					stepSize: 1,
				},
			},
		},
		elements: {
			point: {
				radius: 0, // Hide points
			},
			line: {
				tension: 0, // Straight lines
			},
		},
		maintainAspectRatio: true,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
			},
			datalabels: {
				display: false,
			},
		},
		rotation: lineParams.rotation, // Apply rotation to the chart
	};

	useEffect(() => {
		// Update the equation string whenever lineParams changes
		const m = lineParams.m.toFixed(2); // Format to 2 decimal places
		const b = lineParams.b.toFixed(2);
		const bStr = b.startsWith("-") ? b : `+${b}`; // Format b with a sign
		setEquation(`y = ${m}x ${bStr}`);
	}, [lineParams]);
	const generateRandomEquation = () => {
		// Randomize m to be a value divisible by 0.5 and within the range -10 to 10
		const newM = (Math.round(Math.random() * 40 - 20) / 2).toFixed(2);
		// Randomize b to be a whole number within the range -10 to 10
		const newB = Math.round(Math.random() * 20 - 10);
		setTargetEquation({ m: parseFloat(newM), b: newB });
	};

	const checkAnswer = () => {
		if (
			Math.abs(targetEquation.m - lineParams.m) < 0.1 &&
			Math.abs(targetEquation.b - lineParams.b) < 1
		) {
			setPopupMessage("Correct, try again?");
		} else {
			setPopupMessage("Incorrect, try again.");
		}
		setShowPopup(true);
		// Reload the app to start over
	};

	const confirmAnswer = () => {
		setShowPopup(false);
		window.location.reload();
	};
	const toggleEquation = () => {
		setShowEquation((prev) => !prev);
	};

	useEffect(() => {
		// Generate a random target equation within the graph's range when the component mounts
		generateRandomEquation();
	}, []);
	return (
		<div className="App">
			{showPopup && <Popup message={popupMessage} confirm={confirmAnswer} />}

			<div className="graph_box">
				<div className="line_graph" style={{ width: "50%" }}>
					<Line data={data} options={options} />
				</div>
				<div style={{ width: "20%" }}>
					{/* <div className="arrow_box">
					<button type="button" onClick={rotateLine}>
						↻
					</button>
				</div> */}
					<div className="question_container">
						Match the line on the graph as the equation shown below:
						<div className="target_equation">
							y = {targetEquation.m.toFixed(2)}x{" "}
							{targetEquation.b >= 0
								? `+ ${targetEquation.b.toFixed(2)}`
								: targetEquation.b.toFixed(2)}
						</div>
					</div>

					<div className="arrow_box">
						<button
							type="button"
							id="right_arrow"
							onClick={() => moveLine("right")}
						>
							↺
						</button>
						<button
							type="button"
							id="left_arrow"
							onClick={() => moveLine("left")}
						>
							↻
						</button>
					</div>
					<div className="arrow_box">
						<button
							type="button"
							id="down_arrow"
							onClick={() => moveLine("up")}
						>
							➣
						</button>
						<button type="button" id="" onClick={() => moveLine("down")}>
							➣
						</button>
					</div>
					<div className="arrow_box">
						<button onClick={toggleEquation} type="button">
							Toggle Equation
						</button>
					</div>
					{showEquation && (
						<div id="help_equation" className="equation_display">
							{equation}
						</div>
					)}
					<div className="arrow_box">
						<button
							type="button"
							onClick={checkAnswer}
							className="submit_button"
						>
							Submit
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
