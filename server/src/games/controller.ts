import {
  JsonController,
  Authorized,
  CurrentUser,
  Post,
  Param,
  BadRequestError,
  HttpCode,
  NotFoundError,
  ForbiddenError,
  Get,
  Body,
  Patch
} from "routing-controllers";
import User from "../users/entity";
import { Game, Player } from "./entities";
import {
  calculateWinner,
  checkLetter,
  deleteFromAlphabet,
  updateTemplate
} from "./logic";
import { io } from "../index";
import * as request from "superagent";

const alph = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
];

const getQuestion = (): any => {
  return request
    .get(`https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple`)
    .then(result => {
      const answ = result.body.results[0].correct_answer;
      if (/^[a-zA-Z\s]+$/.test(answ) && answ.length < 13) {
        let temp = answ
          .split("")
          .map(char => (char === " " ? " " : "_"))
          .join("");
        return {
          question: result.body.results[0].question,
          answer: result.body.results[0].correct_answer.toUpperCase(),
          template: temp
        };
      } else {
        getQuestion();
      }
    })
    .catch(err => console.error(err));
};

@JsonController()
export default class GameController {
  @Authorized()
  @Post("/games")
  @HttpCode(201)
  async createGame(@CurrentUser() user: User) {
    const data = await getQuestion();

    const entity = await Game.create({
      question: data.question,
      answer: data.answer,
      template: data.template,
      alphabet: alph,
      round: 1
    }).save();

    await Player.create({
      game: entity,
      user,
      symbol: "x",
      points: 0
    }).save();

    const game = await Game.findOneById(entity.id);

    io.emit("action", {
      type: "ADD_GAME",
      payload: game
    });

    return game;
  }

  @Authorized()
  @Post("/games/:id([0-9]+)/players")
  @HttpCode(201)
  async joinGame(@CurrentUser() user: User, @Param("id") gameId: number) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new BadRequestError(`Game does not exist`);
    if (game.status !== "pending")
      throw new BadRequestError(`Game is already started`);

    game.status = "started";
    await game.save();

    const player = await Player.create({
      game,
      user,
      symbol: "o",
      points: 0
    }).save();

    io.emit("action", {
      type: "UPDATE_GAME",
      payload: await Game.findOneById(game.id)
    });

    return player;
  }

  @Authorized()
  @Patch("/games/:id([0-9]+)")
  async updateGame(
    @CurrentUser() user: User,
    @Param("id") gameId: number,
    @Body() data: { letter: string; word: string, mode: number }
  ) {
    const game = await Game.findOneById(gameId);

    if (!game) throw new NotFoundError(`Game does not exist`);

    const player = await Player.findOne({ user, game });

    if (!player) {
      throw new ForbiddenError(`You are not part of this game`);
    }
    if (game.status !== "started") {
      throw new BadRequestError(`The game is not started yet`);
    }

    if (player.symbol !== game.turn) {
      throw new BadRequestError(`It's not your turn`);
    }

    if (data.letter) {
      game.alphabet = deleteFromAlphabet(data.letter, game.alphabet);
      if (!checkLetter(data.letter, game.answer)) {
        game.turn = player.symbol === "x" ? "o" : "x";
      } else {
        player.points = player.points + data.mode;
        game.template = updateTemplate(data.letter, game.answer, game.template);
        game.turn = player.symbol;
      }
    }

    if (data.word) {
      const word = data.word.toUpperCase();
      const winnerWord = calculateWinner(word, game.answer);
      console.log(winnerWord)
      if (winnerWord && player.symbol === game.turn && game.round !== 4) {
        player.points = player.points + 500 + data.mode;
        game.winner = player.symbol;
        game.round++;

        const newData = await getQuestion();
        game.question = newData.question;
        game.answer = newData.answer;
        game.alphabet = alph;
        game.template = newData.template;
        console.log(newData)
      } else {
        game.turn = player.symbol === "x" ? "o" : "x";
      }

    }


    const winner = calculateWinner(game.template, game.answer);

    if (winner && player.symbol === game.turn && game.round !== 4) {
      player.points = player.points + data.mode + 300;
      game.winner = player.symbol;
      game.round++;
      const newData = await getQuestion();
        game.question = newData.question;
        game.answer = newData.answer;
        game.alphabet = alph;
        game.template = newData.template;
    }

    if( game.round === 4) {
      game.status = "finished";
    }
    await player.save();

    await game.save();

    const newGame = await Game.findOneById(gameId);
  

    io.emit("action", {
      type: "UPDATE_GAME",
      payload: newGame
    });


    return {game, player};
  }

  @Authorized()
  @Get("/games/:id([0-9]+)")
  getGame(@Param("id") id: number) {
    return Game.findOneById(id);
  }

  @Authorized()
  @Get("/games")
  getGames() {
    return Game.find();
  }
}
