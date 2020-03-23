import {
  COST_OF_LIVING,
  RED_COST,
  GREEN_REWARD,
  DISCOUNT,
  LEARNING_RATE
} from "./constants";
import { move } from "./gameLogic";
onmessage = e => {
  if (!e) return;
  let { grid, agent } = e.data;

  //we don't need to update the agent attribute of gridElements anymore
  //so get rid of it
  grid[agent[0]][agent[1]].agent = false;
  //iterate
  for (let i = 0; i < 10000000; i++) {
    //select move, given a grid and agent location
    const intendedDir = Math.floor(Math.random() * 4);

    const { nextLoc, newQ } = move(grid, intendedDir, agent);
    //take intended dir, grid, agentLoc -> return newagentloc, newq, changeinReward, gameover(bool)

    grid[agent[0]][agent[1]].qVals[intendedDir] = newQ;
    agent = nextLoc;
  }

  // return grid object without agent present,
  postMessage(grid);
};
