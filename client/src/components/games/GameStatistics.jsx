import React from "react";
import "./GameStatistics.css";

  export default function GameStatistics(props) {
      return (
        <div className='popup'>
          <div className='popup__inner'>
          <h1> GAME OVER </h1>
          <h2> And the winner is... {props.players[0].points > props.players[1].points ? props.users[props.players[0].userId].firstName.toUpperCase() : props.users[props.players[1].userId].firstName.toUpperCase()} </h2>
          <h3> Final scores </h3>
          {props && <p> {props.users[props.players[1].userId].firstName} : {props.players[1].points} </p>}

          {props && <p> {props.users[props.players[0].userId].firstName} : {props.players[0].points}</p>}
          <button type="button" onClick={() => props.history.push(`/games`)}> Back to the main page </button>
          </div>
        </div>
      );
    }
