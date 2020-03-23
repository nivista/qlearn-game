import {
  COST_OF_LIVING,
  RED_COST,
  GREEN_REWARD,
  DISCOUNT,
  LEARNING_RATE,
  FAIL_RATE
} from "./constants";

export const move = (grid, intendedDir, agentLoc) => {
  const rand = Math.random();
  let dir = intendedDir;
  if (rand < FAIL_RATE / 2) {
    dir++;
  } else if (rand < FAIL_RATE) {
    dir--;
  }
  dir = dir % 4;

  let nextLoc = agentLoc.slice();
  switch (dir) {
    case 0: // left
      nextLoc[1]--;
      break;
    case 1: // up
      nextLoc[0]--;
      break;
    case 2: // right
      nextLoc[1]++;
      break;
    case 3: // down
      nextLoc[0]++;
      break;
    default:
  }

  //find next square and reward, given a grid, agent location, and newLoc
  if (
    nextLoc[0] < 0 ||
    nextLoc[0] >= grid.length ||
    nextLoc[1] < 0 ||
    nextLoc[1] >= grid[0].length
  ) {
    nextLoc = agentLoc; // bring back to previous spot
  }

  let changeInReward = COST_OF_LIVING;
  let nextLocReward;
  let nextType = grid[nextLoc[0]][nextLoc[1]].type;
  let gameover = false;
  switch (nextType) {
    case "normal":
      nextLocReward = Math.max(...grid[nextLoc[0]][nextLoc[1]].qVals);
      break;
    case "wall":
      nextLoc = agentLoc;
      nextLocReward = Math.max(...grid[nextLoc[0]][nextLoc[1]].qVals);
      break;
    case "reward": //change reward accordingly
      changeInReward += GREEN_REWARD;
      gameover = true;
      break;
    case "cost": //change reward accordingly
      changeInReward += RED_COST;
      gameover = true;
      break;
    default:
  }

  if (gameover) {
    nextLoc = [0, 0]; // move back home
    nextLocReward = 0; // new "life" starting, don't keep track of reward
  }

  // update q vals, given a grid, agent location, selected move, and reward
  const prevQ = grid[agentLoc[0]][agentLoc[1]].qVals[intendedDir]; //prevQ

  const proposedQ = changeInReward + (1 - DISCOUNT) * nextLocReward;
  const newQ = prevQ * (1 - LEARNING_RATE) + proposedQ * LEARNING_RATE;

  return { nextLoc, newQ, changeInReward, gameover };
};
