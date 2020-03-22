import React from "react";
import GridSquare from "./GridSquare";
import "./Grid.css";
function Grid(props) {
  const rows = props.data.length;
  const cols = props.data[0].length;
  const style = {
    gridTemplateColumns: "60px ".repeat(cols),
    gridTemplateRows: "60px ".repeat(rows)
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
    <div className="grid" style={style}>
      {gridElements}
    </div>
  );
}

export default Grid;
