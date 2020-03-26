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
          <button
            onClick={this.props.trainAsync}
            className={this.props.workingAsync ? "training" : ""}
          >
            Train Asynchronously
          </button>
          <table>
            <tbody>
              <tr>
                <td>
                  <label>Cost of Living: </label>
                </td>
                <td>
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
                </td>
              </tr>
              <tr>
                <td>
                  <label>Fail Rate: </label>
                </td>

                <td>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ol>
          <li>Use arrow keys to move the agent</li>
          <li>
            The "Fail Rate" will determine the likelihood of the agent moving
            unexpectedly
          </li>
          <li>Lose "Cost of Living" reward with every move</li>
          <li>Left click to edit the board</li>
          <li>
            You can't run into <span>black</span> walls
          </li>
          <li>
            Gain 10 reward for running into a{" "}
            <span style={{ color: "green" }}>green</span> "end state" and
            restart
          </li>
          <li>
            Lose 10 reward for running into a{" "}
            <span style={{ color: "red" }}>red</span> "end state" and restart
          </li>
          <li>
            See how the bot does, and
            <a href="github.com/nivista/qlearn-game">read more</a>!
          </li>
        </ol>
      </div>
    );
  }
}

export default ControlPanel;
