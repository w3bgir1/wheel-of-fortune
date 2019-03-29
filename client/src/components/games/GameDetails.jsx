import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import "./GameDetails.css";
import GameLayout from "./GameLayout";
import GameStatistics from "./GameStatistics";
//import history from './history';

class GameDetails extends PureComponent {
  state = {
    guess: "",
    mode: 0,
    showPopup: false,
    btn: true
  };

  componentWillMount = () => {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  };

  componentDidUpdate = prevProps => {
    if (this.props.game !== prevProps.game) {
      this.setState({ btn: true });
    }
    this.deactivateBtn();
  };

  joinGame = () => this.props.joinGame(this.props.game.id);

  makeMove = event => {
    const letter = event.target.textContent;
    this.props.updateGame(
      this.props.game.id,
      letter,
      this.state.guess,
      this.state.mode
    );
    this.setState({ guess: "", mode: 0, btn: true });
  };

  onSubmit = event => {
    event.preventDefault();
    this.props.updateGame(
      this.props.game.id,
      "",
      this.state.guess,
      this.state.mode
    );
    this.setState({ guess: "", mode: 0, btn: true });
  };

  onChange = event => {
    console.log(event.target.value);
    this.setState({
      guess: event.target.value
    });
  };

  onSpin = text => {
    this.setState({ mode: text, btn: false });
  };

  deactivateBtn = () => {
    const player = this.props.game.players.find(
      p => p.userId === this.props.userId
    );
    if (player.symbol !== this.props.game.turn) {
      this.setState({ btn: false });
    }
  };

  render() {
    const { game, users, authenticated, userId, history } = this.props;

    if (!authenticated) return <Redirect to="/login" />;

    if (game === null || users === null) return "Loading...";
    if (!game) return "Not found";

    const player = game.players.find(p => p.userId === userId);

    let turn = game.players.find(p => p.symbol === game.turn);
    turn = users[turn.userId].firstName;

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0];

    if (player) this.deactivateBtn();

    return (
      <div className="game__container">
        <div className="game__header">
          <p>Game #{game.id}</p>
          {game.status === "started" && player && <p className='game__turn'>It's {turn}'s turn!</p>}

          <p>Status: {game.status}</p>

          <p>Round: {game.round}</p>

          {game.status === "pending" &&
            game.players.map(p => p.userId).indexOf(userId) === -1 && (
              <button onClick={this.joinGame}>Join Game</button>
            )}

          {winner && <p>Previous round winner: {users[winner].firstName}</p>}
        </div>

        {game.status !== "pending" && (
          <div>
            <GameLayout
              data={this.props.game}
              users={this.props.users}
              makeMove={this.makeMove}
              onSubmit={this.onSubmit}
              onChange={this.onChange}
              value={this.state.guess}
              onSpin={this.onSpin}
              btn={this.state.btn}
            />
            <div className="game__alphabet" onClick={this.makeMove}>
              {this.props.game.alphabet.map(char => {
                return (
                  <span className="game__char" key={char}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {game.status === "finished" ? (
          <GameStatistics
            winner={winner}
            users={this.props.users}
            players={this.props.game.players}
            goToTheMainPage={this.goToTheMainPage}
            history={this.props.history}
          />
        ) : null}
      </div>
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
  updateGame
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDetails);
