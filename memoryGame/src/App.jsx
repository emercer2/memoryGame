import "./App.css";
import React, { useState } from "react";
import useLocalStorage from "use-local-storage";
import GameBoard from "./Components/GameBoard";
import Toggle from "./Components/Toggle";

function App() {
  const preference = window.matchMedia("(prefers-color-scheme: ac)").matches;
  const [isAC, setIsAC] = useLocalStorage("kirby", preference);
  const [resetCounter, setResetCounter] = useState(0);

  const toggleText = !isAC ? "Animal Crossing Mode" : "Kirby Mode";
  const theme = isAC ? "Animal Crossing" : "Kirby";

  // when the toggle is pressed, flip mode and trigger a game reset
  const handleToggle = () => {
    setIsAC(!isAC);
    setResetCounter((c) => c + 1);
  };

  return (
    <div className="App" data-theme={isAC ? "ac" : "kirby"}>
      <div className="header">
        <h1>{theme} Memory Game</h1>
      </div>
      <Toggle isChecked={isAC} handleChange={handleToggle} text={`${!isAC ? "Animal Crossing" : "Kirby"} Mode`} />
      <GameBoard key={`game-${isAC}-${resetCounter}`} isAC={isAC} />
    </div>
  );
}

export default App;