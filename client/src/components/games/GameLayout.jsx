import React from "react";
import "./GameLayout.css";
import Wheel from "./Wheel";

export default function GameLayout(props) {
  return (
    <div>
    <div className="game">
      <div className="game__playerOne">
        <img
          src="https://avatarfiles.alphacoders.com/119/119303.jpg"
          alt="Player One"
        />
        {props.users && (
          <p>{props.users[props.data.players[0].userId].firstName}</p>
        )}
        {props.users && <p> Points: {props.data.players[0].points}</p>}
      </div>
      <div className="game__question">
        {props.data && <h1>{props.data.question}</h1>}
        {props.data &&
          props.data.template.split("").map(char =>
            char !== " " ? (
              <span className="game__answerLetters" key={Math.random() * 100}>
                {char}
              </span>
            ) : (
              <span
                className="game__answerLetters game__answerLetters--empty"
                key={Math.random() * 100}
              >
                {char}
              </span>
            )
          )}
      </div>

      <div className="game__playerTwo">
        <img
          src="https://avatarfiles.alphacoders.com/176/176259.jpg"
          alt="Player Two"
        />
        {props.users && (
          <p>{props.users[props.data.players[1].userId].firstName}</p>
        )}
        {props.users && <p> Points: {props.data.players[1].points}</p>}
      </div>
      </div>
      <div className='game__wheel'>
      <div className="game__btns">
        <span className="game__btn--know">I know the answer!</span>
        <form onSubmit={props.onSubmit}>
          <input
            type="text"
            name="word"
            onChange={props.onChange}
            value={props.value}
          />
          <button type="submit">Submit</button>
        </form>
      </div>

      <Wheel onSpin={props.onSpin} baseSize={150} btn={props.btn} />
    </div>
    </div>
  );
  
}
