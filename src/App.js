import React from "react";
import "./App.css";
import Grid from "./Grid";
import ControlPanel from "./ControlPanel";
import RewardsList from "./RewardsList";
const COST_OF_LIVING = -0.2;
const GREEN_REWARD = 10;
const RED_COST = -10;

class App extends React.Component {
  /*
   * Initializes state
   * Creates ref
   */
  constructor(props) {
    super(props);
    const agent = [0, 0];
    const grid = this.initializeGrid(agent);
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

  /*
   * Creates new grid with agent in initial square
   * Resets reward lists
   */
  intializeState() {
    const agent = [0, 0];
    const grid = this.initializeGrid(agent);
    this.setState({
      grid: grid,
      mode: "play",
      agent: agent,
      reward: 0,
      playRewards: [],
      botRewards: []
    });
  }

  /*
   * Creates new grid with agent in starting square and all gridSquares
   * of type normal
   */
  initializeGrid(agent) {
    const grid = [];
    for (let r = 1; r <= 5; r++) {
      const newRow = [];
      grid.push(newRow);
      for (let c = 1; c <= 10; c++) {
        newRow.push({ type: "normal", agent: false, qVals: [0, 0, 0, 0] });
      }
    }
    grid[agent[0]][agent[1]].agent = true;
    return grid;
  }

  /*
   * given : total reward, last reward recieved, and direction agent went
   * to hit goalState square
   * performs q update, updates rewards list, and brings agent to initial state
   */
  gameOver = (totalReward, lastReward, dir) => {
    console.log(this.state.grid);
    let oldQ = this.locToSquare(this.state.agent).qVals[dir];
    let newQ = lastReward;
    let updatedQ = oldQ * 0.5 + newQ * 0.5;
    const newGrid = this.getGridAfterMove(this.state.agent, [0, 0]);
    newGrid[this.state.agent[0]][this.state.agent[1]].qVals[dir] = updatedQ;
    if (this.state.mode === "play") {
      const list = this.state.playRewards.slice();
      list.push(totalReward);
      this.setState({
        playRewards: list,
        grid: newGrid,
        agent: [0, 0],
        reward: 0
      });
    } else if (this.state.mode === "train") {
      const list = this.state.botRewards.slice();
      list.push(totalReward);
      this.setState({
        botRewards: list,
        grid: newGrid,
        agent: [0, 0],
        reward: 0
      });
    }
  };

  /* given : nextLocation and direction agent was going
   * calls gameOver if it was a terminal state
   * otherwise updates state with newLoc
   * handles qUpdates, or passes that to gameOver function
   * returns
   */
  moveAgent = (nextLoc, dir) => {
    let currReward = 0;
    currReward += COST_OF_LIVING;
    const currLoc = this.state.agent;

    if (currLoc[0] === nextLoc[0] && currLoc[1] === nextLoc[1]) {
      //agent didn't successfully move case
      const newGrid = this.getGridAfterMove(currLoc, nextLoc);
      const oldQ = this.locToSquare(currLoc).qVals[dir];
      const newQ =
        currReward + 0.5 * Math.max(...this.locToSquare(nextLoc).qVals);
      const updatedQ = 0.5 * oldQ + 0.5 * newQ;
      newGrid[currLoc[0]][currLoc[1]].qVals[dir] = updatedQ;
      this.setState({ grid: newGrid, reward: this.state.reward + currReward });
    } else if (this.locToSquare(nextLoc).type === "reward") {
      currReward += GREEN_REWARD;
      this.gameOver(this.state.reward + currReward, currReward, dir);
    } else if (this.locToSquare(nextLoc).type === "cost") {
      currReward += RED_COST;
      this.gameOver(this.state.reward + currReward, currReward, dir);
    } else {
      const newGrid = this.getGridAfterMove(currLoc, nextLoc);
      const oldQ = this.locToSquare(currLoc).qVals[dir];
      const newQ =
        currReward + 0.5 * Math.max(...this.locToSquare(nextLoc).qVals);
      const updatedQ = 0.5 * oldQ + 0.5 * newQ;
      newGrid[currLoc[0]][currLoc[1]].qVals[dir] = updatedQ;
      this.setState({
        grid: newGrid,
        agent: nextLoc,
        reward: this.state.reward + currReward
      });
    }
  };

  /*
   * Returns true if agent can move to a location,
   * otherwise returns false (wall or off grid)
   */
  canMoveAgent = loc => {
    return (
      loc &&
      loc[0] >= 0 &&
      loc[1] >= 0 &&
      loc[0] < this.state.grid.length &&
      loc[1] < this.state.grid[0].length &&
      this.state.grid[loc[0]][loc[1]].type !== "wall"
    );
  };

  /* Given an agent movement record, returns a copy of grid with those changes
   * Partially executes deep copy to prevent mutating state
   */
  getGridAfterMove = (prev, next) => {
    const newGrid = this.state.grid.slice();
    newGrid[prev[0]] = newGrid[prev[0]].slice();
    newGrid[next[0]] = newGrid[next[0]].slice();
    newGrid[prev[0]][prev[1]].agent = false;
    newGrid[next[0]][next[1]].agent = true;
    return newGrid;
  };

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
    const row = this.state.agent[0];
    const col = this.state.agent[1];
    const oldSpot = [row, col];
    let dir = e.keyCode - 37; //37 is the key code for left
    const newSpot = this.getNextSpot(oldSpot, dir);

    this.moveAgent(newSpot, dir);
  };

  reset = () => {};
  setMode = mode => {
    if (this.state.mode === mode) return;
    clearInterval(this.state.botInterval);
    if (mode === "train") {
      var botInterval = setInterval(this.botMove, 1);
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
      let square = this.locToSquare(this.state.agent);
      let max = Math.max(...square.qVals);
      let options = [];
      square.qVals.forEach((val, i) => {
        if (val === max) {
          options.push(i);
        }
      });
      var dir = options[Math.floor(Math.random() * options.length)];
      console.log(options);
      console.log(dir);
    } else {
      //move randomly
      var dir = Math.floor(Math.random() * 4);
    }
    let nextSpot = this.getNextSpot(this.state.agent, dir);
    this.moveAgent(nextSpot, dir);
  };

  //given a location, returns the relevant grid square
  locToSquare = loc => {
    return this.state.grid[loc[0]][loc[1]];
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
          reset={this.reset}
        />
        <Grid data={this.state.grid} switchType={this.switchType} />
        <RewardsList title="Play Rewards" rewards={this.state.playRewards} />
        <RewardsList title="Bot Rewards" rewards={this.state.botRewards} />
      </div>
    );
  }
}

export default App;
