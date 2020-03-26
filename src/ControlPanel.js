import React from "react";
import "./ControlPanel.css";
import { COST_OF_LIVING_DEFAULT, FAIL_RATE_DEFAULT, MODES } from "./constants";

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
        <div>
          {Object.values(MODES).map((mode, idx) => (
            <button
              onClick={() => this.props.setMode(mode)}
              className={`mode${mode === this.props.mode ? " selected" : ""}`}
              key={idx}
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
        </div>
        <ol>
          <li>Left click to edit board</li>
          <li>Use arrow keys to move agent</li>
          <li>
            The "Fail Rate" will determine the likelihood of the agent moving
            unexpectedly
          </li>
          <li>Collect "Cost of Living" reward with every move</li>
          <li>Collect +10 reward for running into a green "end state"</li>
          <li>Collect -10 reward for running into a red "end state"</li>
          <li>
            See how the bot does, and read more about&nbsp;
            <a href="https://en.wikipedia.org/wiki/Q-learning">Q-Learning</a>!
          </li>
        </ol>
      </div>
    );
  }
}

export default ControlPanel;
