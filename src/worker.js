import { move } from "./gameLogic";
onmessage = e => {
  if (!e) return;
  let { grid, agent, costOfLiving, failRate } = e.data;

  //we don't need to update the agent attribute of gridElements anymore
  //so get rid of it
  grid[agent[0]][agent[1]].agent = false;
  //iterate
  for (let i = 0; i < 10000000; i++) {
    //select move, given a grid and agent location
    let intendedDir;
    if (Math.random() < 0.8) {
      // best move
      let square = grid[agent[0]][agent[1]];
      let max = Math.max(...square.qVals);
      let options = [];

      square.qVals.forEach((val, i) => {
        if (val === max) {
          options.push(i);
        }
      });
      intendedDir = options[Math.floor(Math.random() * options.length)];
    } else {
      // explore
      intendedDir = Math.floor(Math.random() * 4);
    }
    const { nextLoc, newQ } = move(
      grid,
      intendedDir,
      agent,
      costOfLiving,
      failRate
    );
    //take intended dir, grid, agentLoc -> return newagentloc, newq, changeinReward, gameover(bool)

    grid[agent[0]][agent[1]].qVals[intendedDir] = newQ;
    agent = nextLoc;
  }

  // return grid object without agent present,
  postMessage(grid);
};
