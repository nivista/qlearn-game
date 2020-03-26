import { RED_COST, GREEN_REWARD, DISCOUNT, LEARNING_RATE } from "./constants";

/* Given an array of objects grid, and an intended direction integer from 0-3
 * representing left, up, right, or down, a costOfLiving representing base changes
 * change in reward for each move and a failRate indicating likelihood of
 * turning left or right unintentionally
 * Returns the agents nextLocation, the change in reward, the updated qval,
 * and whether or not it was gameover
 */
export const move = (grid, intendedDir, agentLoc, costOfLiving, failRate) => {
  const rand = Math.random();
  let dir = intendedDir;
  if (rand < failRate / 2) {
    dir++;
  } else if (rand < failRate) {
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

  if (
    nextLoc[0] < 0 ||
    nextLoc[0] >= grid.length ||
    nextLoc[1] < 0 ||
    nextLoc[1] >= grid[0].length
  ) {
    nextLoc = agentLoc; // bring back to previous spot
  }

  let changeInReward = costOfLiving;
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
    case "reward":
      changeInReward += GREEN_REWARD;
      gameover = true;
      break;
    case "cost":
      changeInReward += RED_COST;
      gameover = true;
      break;
    default:
  }

  if (gameover) {
    nextLoc = [0, 0];
    nextLocReward = 0;
  }

  const prevQ = grid[agentLoc[0]][agentLoc[1]].qVals[intendedDir];

  const proposedQ = changeInReward + (1 - DISCOUNT) * nextLocReward;
  const newQ = prevQ * (1 - LEARNING_RATE) + proposedQ * LEARNING_RATE;
  return { nextLoc, newQ, changeInReward, gameover };
};

/* Takes a 2d array of objects grid and array agent ([row,col])
 * With probability exploitProb returns a best direction based on qvals
 * Otherwise returns a random move
 */
export function chooseMove(grid, agent, exploitProb) {
  if (Math.random() < exploitProb) {
    // best move
    let square = grid[agent[0]][agent[1]];
    let max = Math.max(...square.qVals);
    let options = [];

    square.qVals.forEach((val, i) => {
      if (val === max) {
        options.push(i);
      }
    });
    return options[Math.floor(Math.random() * options.length)];
  } else {
    // explore
    return Math.floor(Math.random() * 4);
  }
}
