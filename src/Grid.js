import React from "react";
import GridSquare from "./GridSquare";
import "./Grid.css";
import ResultsPlot from "./ResultsPlot";

function Grid(props) {
  const rows = props.data.length;
  const cols = props.data[0].length;
  const style = {
    gridTemplateColumns: "60px ".repeat(cols) + "auto",
    gridTemplateRows: "60px ".repeat(rows) + "20px"
  };
  const switchType = (row, col) => {
    return function() {
      props.switchType(row, col);
    };
  };
  const gridElements = props.data.map(function(row, r) {
    return row
      .map(function(data, c) {
        return (
          <GridSquare
            switch={switchType(r, c)}
            row={r}
            col={c}
            data={data}
            key={`${r}${c}`}
          />
        );
      })
      .flat();
  });
  return (
    <div
      className="grid"
      style={style}
      ref={props.aRef}
      onKeyDown={props.keyDownFunc}
      tabIndex={0}
    >
      {gridElements}
      <ResultsPlot
        style={{
          gridColumnStart: cols + 1,
          gridColumnEnd: cols + 2,
          gridRowStart: 1,
          gridRowEnd: rows + 1
        }}
        title="Bot Rewards History"
        data={props.rewardsData}
      />
      <p
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 4,
          gridRowStart: rows + 1,
          gridRowEnd: rows + 2
        }}
      >
        Current Reward: {Math.floor(props.currReward * 10) / 10}
      </p>
      <p
        style={{
          gridColumnStart: 4,
          gridColumnEnd: 7,
          gridRowStart: rows + 1,
          gridRowEnd: rows + 2
        }}
      >
        Last Reward: {Math.floor(props.lastReward * 10) / 10 || "_"}
      </p>
    </div>
  );
}

export default Grid;
