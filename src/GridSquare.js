import React from "react";
import "./GridSquare.css";
import { DISPLAY_Q_VALUES } from "./constants";

function GridSquare(props) {
  const col = props.col + 1; //array index to grid index
  const row = props.row + 1;
  const style = {
    gridColumnStart: col,
    gridColumnEnd: col + 1,
    gridRowStart: row,
    gridRowEnd: row + 1
  };
  const agent = props.data.agent ? " agent" : "";
  const start = col === 1 && row === 1 ? " start" : "";
  return (
    <div
      onClick={props.switch}
      style={style}
      className={"gridSquare " + props.data.type + agent + start}
    >
      {DISPLAY_Q_VALUES ? (
        <>
          <div className="tri left">
            <p>{Math.round(props.data.qVals[0] * 10) / 10}</p>
          </div>
          <div className="tri up">
            <p>{Math.round(props.data.qVals[1] * 10) / 10}</p>
          </div>
          <div className="tri right">
            <p>{Math.round(props.data.qVals[2] * 10) / 10}</p>
          </div>
          <div className="tri down">
            <p>{Math.round(props.data.qVals[3] * 10) / 10}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
export default GridSquare;
