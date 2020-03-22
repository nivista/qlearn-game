import React from "react";
import "./RewardsList.css";

function RewardsList(props) {
  return (
    <div className="rewardslist">
      <h3>{props.title}</h3>
      <ul>
        {props.rewards.map((reward, index) => {
          return <li key={index}>{Math.floor(reward * 100) / 100}</li>;
        })}
      </ul>
    </div>
  );
}

export default RewardsList;
