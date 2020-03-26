import React from "react";

import {
  COST_OF_LIVING_DEFAULT,
  FAIL_RATE_DEFAULT,
  ROWS,
  COLS,
  MODES,
  EPSILON
} from "./constants";
import "./App.css";
import Grid from "./Grid";
import ControlPanel from "./ControlPanel";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./worker.js";
import { move, chooseMove } from "./gameLogic";

class App extends React.Component {
  constructor(props) {
    super(props);
    const agent = [0, 0];
    const grid = [];
    for (let r = 1; r <= ROWS; r++) {
      const newRow = [];
      grid.push(newRow);
      for (let c = 1; c <= COLS; c++) {
        newRow.push({
          type: "normal",
          agent: false,
          qVals: [0, 0, 0, 0],
          counts: [0, 0, 0, 0]
        });
      }
    }
    grid[agent[0]][agent[1]].agent = true;
    this.state = {
      grid: grid,
      mode: MODES.HUMAN_PLAY,
      agent: agent,
      reward: 0,
      lastReward: "_",
      botRewards: [],
      costOfLiving: COST_OF_LIVING_DEFAULT,
      failRate: FAIL_RATE_DEFAULT,
      workingAsync: false
    };
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.focusDiv();
    this.worker = new Worker();
    this.worker.addEventListener("message", e => {
      this.setState({ workingAsync: false });
      const agent = this.state.agent;
      e.data[agent[0]][agent[1]].agent = true;
      for (let r = 0; r < e.data.length; r++) {
        for (let c = 0; c < e.data[0].length; c++) {
          e.data[r][c].type = this.state.grid[r][c].type;
        }
      }
      this.setState({ grid: e.data });
    });
  }

  // focuses on grid
  focusDiv = () => {
    this.myRef.current.focus({ preventScroll: true });
  };

  // given row/col of gridSquare, changes its type
  // (normal -> wall -> reward -> cost -> normal)
  switchType = (row, col) => {
    const newGrid = this.state.grid.slice();
    newGrid[row] = newGrid[row].slice();
    switch (newGrid[row][col].type) {
      case "normal":
        newGrid[row][col].type = "wall";
        break;
      case "wall":
        newGrid[row][col].type = "reward";
        break;
      case "reward":
        newGrid[row][col].type = "cost";
        break;
      case "cost":
        newGrid[row][col].type = "normal";
        break;
      default:
    }
    this.setState({ grid: newGrid });
  };

  /* Does nothing in HUMAN_PLAY mode or if arrow keys weren't pressed
   * otherwise does move indicated by arrow keys and updates state
   */
  handleKeyDown = e => {
    if (
      this.state.mode !== MODES.HUMAN_PLAY ||
      e.keyCode < 37 ||
      e.keyCode > 40
    ) {
      return;
    }
    e.preventDefault();
    let dir = e.keyCode - 37; //37 is the key code for left
    const { nextLoc, newQ, changeInReward, gameover } = move(
      this.state.grid,
      dir,
      this.state.agent,
      this.state.costOfLiving,
      this.state.failRate
    );
    this.updateState(dir, nextLoc, newQ, changeInReward, gameover);
  };

  // if passed mode is different then current mode, changes mode, clearsIntervals
  // and starts a interval for bot movement if mode is BOT_TRAIN or BOT_PLAY
  setMode = mode => {
    if (this.state.mode === mode) return;
    clearInterval(this.state.botInterval);
    let botInterval = null;
    if (mode === MODES.BOT_TRAIN) {
      botInterval = setInterval(this.botMove, 10);
    } else if (mode === MODES.BOT_PLAY) {
      botInterval = setInterval(this.botMove, 150);
    }

    //set interval for doing training move if
    this.setState({ mode: mode, botInterval: botInterval });
  };

  //Executes move by bot and updates state
  //updates q values
  botMove = () => {
    let exploitProb = this.state.mode === MODES.BOT_TRAIN ? EPSILON : 1;
    let dir = chooseMove(this.state.grid, this.state.agent, exploitProb);

    const { nextLoc, newQ, changeInReward, gameover } = move(
      this.state.grid,
      dir,
      this.state.agent,
      this.state.costOfLiving,
      this.state.failRate
    );
    this.updateState(dir, nextLoc, newQ, changeInReward, gameover);
  };

  // Updates state after a move given intendedDir (0-3), nextLoc ([row, col])
  //newQ (number), changeInReward (number), gameover (boolean)
  updateState = (intendedDir, nextLoc, newQ, changeInReward, gameover) => {
    const grid = this.state.grid.slice();
    grid[this.state.agent[0]] = grid[this.state.agent[0]].slice();
    grid[nextLoc[0]] = grid[nextLoc[0]].slice();

    let currGridSquare = {};
    grid[this.state.agent[0]][this.state.agent[1]] = Object.assign(
      currGridSquare,
      grid[this.state.agent[0]][this.state.agent[1]]
    );
    grid[this.state.agent[0]][this.state.agent[1]] = currGridSquare;
    //update qVals
    currGridSquare.qVals = currGridSquare.qVals.slice();
    currGridSquare.qVals[intendedDir] = newQ;

    //update counts
    currGridSquare.counts = currGridSquare.counts.slice();
    currGridSquare.counts[intendedDir]++;

    //move agent
    currGridSquare.agent = false;
    grid[nextLoc[0]][nextLoc[1]].agent = true;
    //change rewards
    let reward = this.state.reward + changeInReward;
    let lastReward = this.state.lastReward;
    if (gameover && this.state.mode !== MODES.HUMAN_PLAY) {
      const rewardsList = this.state.botRewards.slice();
      rewardsList.push(reward);
      this.setState({ botRewards: rewardsList });
    }
    if (gameover) {
      lastReward = reward;
      reward = 0; //reset reward
    }

    this.setState({
      reward,
      grid,
      lastReward,
      agent: nextLoc
    });
  };

  updateCostOfLiving = e => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val) && val <= 0 && val >= -10)
      this.setState({ costOfLiving: val });
  };

  updateFailRate = e => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 1) {
      this.setState({ failRate: val });
    }
  };

  trainAsync = () => {
    this.setState({ workingAsync: true });
    this.worker.postMessage({
      grid: this.state.grid,
      agent: this.state.agent,
      costOfLiving: this.state.costOfLiving,
      failRate: this.state.failRate
    });
  };

  render() {
    return (
      <div className="App" tabIndex={0} onClickCapture={this.focusDiv}>
        <ControlPanel
          setMode={this.setMode}
          mode={this.state.mode}
          costOfLiving={this.state.costOfLiving}
          updateCostOfLiving={this.updateCostOfLiving}
          failRate={this.state.failRate}
          updateFailRate={this.updateFailRate}
          trainAsync={this.trainAsync}
          workingAsync={this.state.workingAsync}
        />
        <Grid
          data={this.state.grid}
          rewardsData={this.state.botRewards}
          switchType={this.switchType}
          aRef={this.myRef}
          keyDownFunc={this.handleKeyDown}
          currReward={this.state.reward}
          lastReward={this.state.lastReward}
          resetRewards={() => this.setState({ botRewards: [] })}
        />
      </div>
    );
  }
}

export default App;
