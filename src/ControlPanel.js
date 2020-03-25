import React from "react";
import "./ControlPanel.css";
import { COST_OF_LIVING_DEFAULT, FAIL_RATE_DEFAULT, MODES } from "./constants";
//we want a way to select, play, train, or both
//use react controlled elements
class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      costOfLiving: COST_OF_LIVING_DEFAULT,
      failRate: FAIL_RATE_DEFAULT
    };
    this.colRef = React.createRef();
    this.failRef = React.createRef();
  }
  updateFailRate = e => {
    this.setState({ failRate: e.target.value });
    this.props.updateFailRate(e);
  };

  updateCostOfLiving = e => {
    this.setState({ costOfLiving: e.target.value });
    this.props.updateCostOfLiving(e);
  };

  render() {
    return (
      <div id="controlPanel">
        {Object.values(MODES).map((mode, idx) => (
          <button
            onClick={() => this.props.setMode(mode)}
            className={`mode${mode === this.props.mode ? " selected" : ""}`}
          >
            {mode}
          </button>
        ))}
        <div style={{ width: "10px", display: "inline-block" }} />
        <button onClick={this.props.trainAsync}>Train Asynchronously</button>
        <br />
        <label>Cost of Living: </label>
        <input
          value={this.state.costOfLiving}
          onChange={this.updateCostOfLiving}
          max={0}
          min={-10}
          step={0.1}
          type="number"
          ref={this.colRef}
          onClick={() => this.colRef.current.focus()}
        ></input>
        <br />
        <label>Fail Rate: </label>
        <input
          value={this.state.failRate}
          onChange={this.updateFailRate}
          min={0}
          max={1}
          type="number"
          step={0.1}
          ref={this.failRef}
          onClick={() => this.failRef.current.focus()}
        ></input>
        <br />
        <label>Reward : {Math.round(this.props.reward * 100) / 100}</label>
      </div>
    );
  }
}

export default ControlPanel;
