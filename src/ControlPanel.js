import React from "react";
import "./ControlPanel.css";
//we want a way to select, play, train, or both
//use react controlled elements
function ControlPanel(props) {
  const playClass = `button ${props.mode === "play" ? "selected" : ""}`;
  const trainClass = `button ${props.mode === "train" ? "selected" : ""}`;
  const bothClass = `button ${props.mode === "both" ? "selected" : ""}`;
  return (
    <div id="controlPanel">
      <div className={playClass} onClick={() => props.setMode("play")}>
        Play
      </div>
      <div className={trainClass} onClick={() => props.setMode("train")}>
        Train
      </div>
      <div className={bothClass} onClick={() => props.setMode("both")}>
        Both
      </div>
      <div id="reward">Reward : {Math.round(props.reward * 100) / 100}</div>
      <div id="reset" onClick={props.reset}></div>
    </div>
  );
}

export default ControlPanel;
