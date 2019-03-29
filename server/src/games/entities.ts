import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  OneToMany,
  ManyToOne
} from "typeorm";
import { IsNumber } from "class-validator";
import User from "../users/entity";

export type Symbol = "x" | "o";

type Status = "pending" | "started" | "finished";

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("char", { length: 1, default: "x" })
  turn: Symbol;

  @Column("char", { length: 1, nullable: true })
  winner: Symbol;

  @Column("text", { default: "pending" })
  status: Status;

  @Column("text")
  question: string;

  @Column("text")
  answer: string;

  @Column("text")
  template: string;

  @Column({ type: "simple-array" })
  alphabet: string[];

  @IsNumber()
  @Column()
  round: number

  @OneToMany(_ => Player, player => player.game, { eager: true })
  players: Player[];
}

@Entity()
@Index(["game", "user", "symbol"], { unique: true })
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @IsNumber()
  @Column()
  points: number


  @ManyToOne(_ => User, user => user.players)
  user: User;

  @ManyToOne(_ => Game, game => game.players)
  game: Game;

  @Column("char", { length: 1 })
  symbol: Symbol;

  @Column("integer", { name: "user_id" })
  userId: number;
}
