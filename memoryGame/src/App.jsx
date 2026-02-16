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

  // when the toggle is pressed, flip mode and trigger a game reset
  const handleToggle = () => {
    setIsAC(!isAC);
    setResetCounter((c) => c + 1);
  };

  return (
    <div className="App" data-theme={isAC ? "ac" : "kirby"}>
      <Toggle isChecked={isAC} handleChange={handleToggle} text={toggleText} />
      <GameBoard key={`game-${isAC}-${resetCounter}`} isAC={isAC} />
    </div>
  );
}

export default App;