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
import { calculateWinner } from "./logic";
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
      symbol: "x"
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
      symbol: "o"
    }).save();

    io.emit("action", {
      type: "UPDATE_GAME",
      payload: await Game.findOneById(game.id)
    });

    return player;
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
  @Patch("/games/:id([0-9]+)")
  async updateGame(
    @CurrentUser() user: User,
    @Param("id") gameId: number,
    @Body() update: { switcher: boolean; template: string; alphabet: string[]; round: number }
  ) {
    const game = await Game.findOneById(gameId);
    //console.log(game)
    if (!game) throw new NotFoundError(`Game does not exist`);

    const player = await Player.findOne({ user, game });
    //console.log(player)

    if (!player) {
      throw new ForbiddenError(`You are not part of this game`);
    }
    if (game.status !== "started") {
      throw new BadRequestError(`The game is not started yet`);
    }

    if (player.symbol !== game.turn) {
      throw new BadRequestError(`It's not your turn`);
    }

    if (update.switcher) {
      game.turn = player.symbol === "x" ? "o" : "x";
    } else {
      game.turn = player.symbol;
    }

    const winner = calculateWinner(update.template, game.answer);
    if (winner && player.symbol === game.turn) {
      game.winner = player.symbol;
      game.round++;
      const data = await getQuestion();

      game.question = data.question;
      game.answer = data.answer;
      game.alphabet = alph;
      game.template = data.template;
      await game.save();
      io.emit("action", {
        type: "UPDATE_GAME",
        payload: game
      });

    } else {
      game.template = update.template;
      game.alphabet = update.alphabet;
      await game.save();

    io.emit("action", {
      type: "UPDATE_GAME",
      payload: game
    });

    return game;
    }
    return game
    
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
