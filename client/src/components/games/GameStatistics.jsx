import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import Paper from "@material-ui/core/Paper";
import "./GameDetails.css";
import GameLayout from "./GameLayout";

class GameStatisctics extends PureComponent {
  state ={
    guess: ''
  }

}
