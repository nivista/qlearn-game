import React from "react";
import { LineChart, Line, YAxis } from "recharts";
import "./ResultsPlot.css";
export default function ResultsPlot(props) {
  const { data, title, style } = props;

  return (
    <div style={{ ...style, textAlign: "center" }}>
      <span class="title">{title}</span>
      <button class="reset" onClick={props.resetRewards}>
        Reset
      </button>
      <LineChart
        width={400}
        height={200}
        data={data.map(x => {
          return { data: x };
        })}
        title="title"
      >
        <Line type="monotone" dataKey="data" stroke="#8884d8" />
        <YAxis />
      </LineChart>
    </div>
  );
}
