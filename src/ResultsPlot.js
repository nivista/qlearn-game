import React from "react";
import { LineChart, Line, YAxis } from "recharts";

export default function ResultsPlot(props) {
  const { data, title, style } = props;

  return (
    <div style={{ ...style, textAlign: "center" }}>
      <h3>{title}</h3>
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
