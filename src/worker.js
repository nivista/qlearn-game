import { move, chooseMove } from "./gameLogic";
import { EPSILON } from "./constants";

/* Recieves event with 2d array of objects grid, agent ([row],[col]),
 * costOfLiving (numer) and failRate (number)
 * Does 10,000,000 moves and updates q values, returning a grid w/ updates
 * and no agent on any of the grid squares
 */
onmessage = e => {
  if (!e) return;
  let { grid, agent, costOfLiving, failRate } = e.data;

  grid[agent[0]][agent[1]].agent = false;

  for (let i = 0; i < 10000000; i++) {
    let intendedDir = chooseMove(grid, agent, EPSILON);

    const { nextLoc, newQ } = move(
      grid,
      intendedDir,
      agent,
      costOfLiving,
      failRate
    );

    grid[agent[0]][agent[1]].qVals[intendedDir] = newQ;
    grid[agent[0]][agent[1]].counts[intendedDir]++;
    agent = nextLoc;
  }

  postMessage(grid);
};
