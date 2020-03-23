import React from "react";

import {
  COST_OF_LIVING,
  RED_COST,
  GREEN_REWARD,
  DISCOUNT,
  LEARNING_RATE,
  ROWS,
  COLS
} from "./constants";
import "./App.css";
import Grid from "./Grid";
import ControlPanel from "./ControlPanel";
import RewardsList from "./RewardsList";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./worker.js";
import { move } from "./gameLogic";

class App extends React.Component {
  /*
   * Initializes state
   * Creates ref
   */
  constructor(props) {
    super(props);
    const agent = [0, 0];
    const grid = [];
    for (let r = 1; r <= ROWS; r++) {
      const newRow = [];
      grid.push(newRow);
      for (let c = 1; c <= COLS; c++) {
        newRow.push({ type: "normal", agent: false, qVals: [0, 0, 0, 0] });
      }
    }
    grid[agent[0]][agent[1]].agent = true;
    this.state = {
      grid: grid,
      mode: "play",
      agent: agent,
      reward: 0,
      playRewards: [],
      botRewards: []
    };
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.focusDiv();
    this.worker = new Worker();
    this.worker.addEventListener("message", e => {
      const agent = this.state.agent;
      e.data[agent[0]][agent[1]].agent = true;
      this.setState({ grid: e.data });
    });
  }

  componentDidUpdate() {
    this.focusDiv();
  }

  /*
   * Focuses on main app div
   */
  focusDiv() {
    this.myRef.current.focus();
  }

  /* given row/col of gridSquare, changes its type
   * (normal -> wall -> reward -> cost -> normal)
   */
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

  /* Given old spot and intended direction, returns new spot coords
   * 5% chance of going clockwise of intended direction, 5% chance of
   * going counter clockwise, 90% of going in intended direction
   */
  getNextSpot = (oldSpot, dir) => {
    const rand = Math.random();
    if (rand < 0.05) {
      dir++;
    } else if (rand < 0.1) {
      dir--;
    }
    dir = dir % 4;
    const newSpot = oldSpot.slice();
    switch (dir) {
      case 0: // left
        newSpot[1]--;
        break;
      case 1: // up
        newSpot[0]--;
        break;
      case 2: // right
        newSpot[1]++;
        break;
      case 3: // down
        newSpot[0]++;
        break;
      default:
    }
    if (!this.canMoveAgent(newSpot)) {
      return oldSpot;
    }
    return newSpot;
  };

  /* Does nothing if mode === "train" or arrow keys weren't pressed
   * calls moveagent with direction given by arrowkeys and newspot Given
   * by getNextSpot
   */
  handleKeyDown = e => {
    if (this.state.mode === "train" || e.keyCode < 37 || e.keyCode > 40) {
      return;
    }
    e.preventDefault();
    const row = this.state.agent[0];
    const col = this.state.agent[1];
    const oldSpot = [row, col];
    let dir = e.keyCode - 37; //37 is the key code for left
    const { nextLoc, newQ, changeInReward, gameover } = move(
      this.state.grid,
      dir,
      this.state.agent
    );
    this.updateState(dir, false, nextLoc, newQ, changeInReward, gameover);
  };

  /* if applicable, changes mode
   * stops all intervals and workers
   * if the mode is "train" initializes botInterval
   * if the mode is "both" tells worker to train in the background
   */
  setMode = mode => {
    if (this.state.mode === mode) return;
    clearInterval(this.state.botInterval);
    if (mode === "train") {
      var botInterval = setInterval(this.botMove, 10);
    } else if (mode == "both") {
      this.worker.postMessage({
        grid: this.state.grid,
        agent: this.state.agent
      });
    }
    //set interval for doing training move if
    this.setState({ mode: mode, botInterval: botInterval });
  };

  /* Executes move by bot and updates state
   * updates q values
   */
  botMove = () => {
    if (Math.random() < 0.8) {
      //pick best move
      let square = this.state.grid[this.state.agent[0]][this.state.agent[1]];

      let max = Math.max(...square.qVals);
      let options = [];
      square.qVals.forEach((val, i) => {
        if (val === max) {
          options.push(i);
        }
      });
      var dir = options[Math.floor(Math.random() * options.length)];
    } else {
      //move randomly
      var dir = Math.floor(Math.random() * 4);
    }
    const { nextLoc, newQ, changeInReward, gameover } = move(
      this.state.grid,
      dir,
      this.state.agent
    );
    this.updateState(dir, true, nextLoc, newQ, changeInReward, gameover);
  };

  updateState = (intendedDir, bot, nextLoc, newQ, changeInReward, gameover) => {
    const grid = this.state.grid.slice();
    grid[this.state.agent[0]] = grid[this.state.agent[0]].slice();
    grid[nextLoc[0]] = grid[nextLoc[0]].slice();

    //update qVals
    grid[this.state.agent[0]][this.state.agent[1]].qVals[intendedDir] = newQ;
    //move agent
    grid[this.state.agent[0]][this.state.agent[1]].agent = false;
    grid[nextLoc[0]][nextLoc[1]].agent = true;
    //change rewards
    let reward = this.state.reward + changeInReward;
    if (gameover && bot) {
      //update rewards lists if game is over
      const rewardsList = this.state.botRewards.slice();
      rewardsList.push(reward);
      this.setState({ botRewards: rewardsList });
      reward = 0; //reset reward
    } else if (gameover) {
      const rewardsList = this.state.playRewards.slice();
      rewardsList.push(reward);
      this.setState({ playRewards: rewardsList });
      reward = 0; //reset reward
    }

    this.setState({ reward, grid, agent: nextLoc });
  };

  render() {
    return (
      <div
        className="App"
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
        ref={this.myRef}
      >
        <ControlPanel
          setMode={this.setMode}
          mode={this.state.mode}
          reward={this.state.reward}
        />
        <Grid data={this.state.grid} switchType={this.switchType} />
        <RewardsList title="Play Rewards" rewards={this.state.playRewards} />
        <RewardsList title="Bot Rewards" rewards={this.state.botRewards} />
      </div>
    );
  }
}

export default App;
