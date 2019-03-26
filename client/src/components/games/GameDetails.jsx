import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import Paper from "@material-ui/core/Paper";
import "./GameDetails.css";
import { getQuestion } from "../../actions/questions.js";
import GameLayout from "./GameLayout";

class GameDetails extends PureComponent {
  state = {
    alphabet: [
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ],
    answer: [],
    usedLetters: []
  };

  componentDidMount() {
    this.props.getQuestion();
  }

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  makeMove = (toRow, toCell) => {
    const { game, updateGame } = this.props;

    const board = game.board.map((row, rowIndex) =>
      row.map((cell, cellIndex) => {
        if (rowIndex === toRow && cellIndex === toCell) return game.turn;
        else return cell;
      })
    );
    updateGame(game.id, board);
  };



  checkIfAnswerContainsLetter = (event) => {
    const letter = event.target.textContent;
    const newAphabet = this.state.alphabet.filter(el => el !== letter)
    this.setState({
      usedLetters: this.state.usedLetters.concat(letter),
      alphabet: newAphabet
    })
    if (this.props.question.answer.includes(letter)) {
      const indexes = this.props.question.answer.split('').reduce((acc, el, i) => {
        if (el === letter) {
          return acc.concat(i)
        } 
        return acc
      }, [])

      const newTemp = this.props.question.template
      indexes.map(i => {
        newTemp[i] = letter
      })
      this.props.question.template = newTemp
    }
  }



  render() {
    const { game, users, authenticated, userId } = this.props;

    if (!authenticated) return <Redirect to="/login" />;

    if (game === null || users === null) return "Loading...";
    if (!game) return "Not found";

    const player = game.players.find(p => p.userId === userId);

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0];

    return (
      <Paper className="outer-paper">
        <h1>Game #{game.id}</h1>

        <p>Status: {game.status}</p>

        {game.status === "started" && player && player.symbol === game.turn && (
          <div>It's your turn!</div>
        )}

        {game.status === "pending" &&
          game.players.map(p => p.userId).indexOf(userId) === -1 && (
            <button onClick={this.joinGame}>Join Game</button>
          )}

        {winner && <p>Winner: {users[winner].firstName}</p>}

        <hr />

        {game.status !== "pending" && (
          <GameLayout
            data={this.props.question}
            users={this.props.users}
            alphabet={this.state.alphabet}
            selectChar={this.checkIfAnswerContainsLetter}
          />
        )}
      </Paper>
    );
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users,
  question: state.question
});

const mapDispatchToProps = {
  getGames,
  getUsers,
  joinGame,
  updateGame,
  getQuestion
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDetails);
