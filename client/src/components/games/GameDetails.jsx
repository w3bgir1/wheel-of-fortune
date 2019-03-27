import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame, checkWord } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import Paper from "@material-ui/core/Paper";
import "./GameDetails.css";
import GameLayout from "./GameLayout";

class GameDetails extends PureComponent {

  state ={
    guess: ''
  }
  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  checkIfAnswerContainsLetter = event => {
    const { game, updateGame } = this.props;
    const letter = event.target.textContent;
    let newTemp = game.template.split("");
    const newAphabet = this.props.game.alphabet.filter(el => el !== letter);
    if (this.props.game.answer.includes(letter)) {
      const indexes = this.props.game.answer.split("").reduce((acc, el, i) => {
        if (el === letter) {
          return acc.concat(i);
        }
        return acc;
      }, []);

      indexes.map(i => {
        newTemp[i] = letter;
      });
      updateGame(game.id, false, newTemp.join(""), newAphabet);
    } else {
      updateGame(game.id, true, newTemp.join(""), newAphabet);
    }
  }

  onSubmit = event => {
    event.preventDefault()
    this.props.checkWord(this.props.game.id, this.state.guess)
    this.setState({guess: ''})
  }

  onChange = (event) => {
    console.log(event.target.value)
    this.setState({
      guess: event.target.value
    })
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
            data={this.props.game}
            users={this.props.users}
            alphabet={this.props.game.alphabet}
            selectChar={this.checkIfAnswerContainsLetter}
            onSubmit={this.onSubmit}
            onChange={this.onChange}
            value={this.state.guess}
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
  users: state.users
});

const mapDispatchToProps = {
  getGames,
  getUsers,
  joinGame,
  updateGame,
  checkWord
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDetails);
