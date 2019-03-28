import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import Paper from "@material-ui/core/Paper";
import "./GameDetails.css";
import GameLayout from "./GameLayout";
import GameStatistics from "./GameStatistics";
//import history from './history';


class GameDetails extends PureComponent {

  state = {
    guess: '',
    mode: 0,
    showPopup: false
  }
  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  makeMove = event => {

    const letter = event.target.textContent;
    this.props.updateGame(this.props.game.id, letter, '');
  
  }

  onSubmit = event => {
    event.preventDefault()
    this.props.updateGame(this.props.game.id, '', this.state.guess);
    this.setState({guess: ''})
  }

  onChange = (event) => {
    console.log(event.target.value)
    this.setState({
      guess: event.target.value
    })
  }

  onSpin = (text) => {
    this.setState({mode: text})
  } 


  render() {
    const { game, users, authenticated, userId, history } = this.props;

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
        <p>Round: {game.round}</p>

        {game.status === "started" && player && player.symbol === game.turn && (
          <div>It's your turn!</div>
        )}

        {game.status === "pending" &&
          game.players.map(p => p.userId).indexOf(userId) === -1 && (
            <button onClick={this.joinGame}>Join Game</button>
          )}

        {winner && <p>Previous round winner: {users[winner].firstName}</p>}

        <hr />

        {game.status !== "pending" && (
          <GameLayout
            data={this.props.game}
            users={this.props.users}
            makeMove={this.makeMove}
            onSubmit={this.onSubmit}
            onChange={this.onChange}
            value={this.state.guess}
            onSpin={this.onSpin}
          />
        )}
        {game.status === "finished" ? 
          <GameStatistics 
          winner={winner} 
          users={this.props.users}
          players={this.props.game.players}
          goToTheMainPage={this.goToTheMainPage}
          history={this.props.history}
          />
          : 
          null
        }
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
  updateGame
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDetails);
