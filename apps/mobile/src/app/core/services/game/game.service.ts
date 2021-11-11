import { Injectable } from '@angular/core';
import { GameBoard } from "../ai/ai.service";
import { DrawerDirective } from "../../directives/drawer/drawer.directive";
import { BitBoard } from "../board/bit-board";
import { BoardService } from "../board/board.service";
import { Combination } from "../board/combination";

export enum PlayerType {
  HUMAN,
  AI
}


export class Player {
  type: PlayerType;
  workerOrService: any;

  constructor(type: PlayerType, workerOrService: any) {
    this.type = type;
    this.workerOrService = workerOrService;
  }

  async next(): Promise<GameBoard> {
    const subscription = this.workerOrService.onMessage();
    this.workerOrService.message("getNextActiion");
    return subscription;
  }
}

@Injectable({
  providedIn: 'root'
})

export class GameService {
  size = 19;
  players: Player[] = [];
  worker?: Worker;
  private _turn = 0;

  get turn() {
    return Math.ceil(this._turn / this.players.length);
  }

  constructor(private readonly drawerDirective: DrawerDirective,
              private readonly boardService: BoardService) {
    console.log("Game Service")
  }

  initGame(size: number = 19, players: PlayerType[]) {
    this.size = size;
    if (this.worker) {
      //TODO: delete existing worker before init
    }
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./game.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage('hello');
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
    players.map(player => {
      if (player === PlayerType.HUMAN) {
        this.players.push(new Player(player, this.drawerDirective));
      } else {
        this.players.push(new Player(player, this.worker));
      }
    });
  }

  async nextTurn() {
    const gameBoard = await this.players[this._turn % this.players.length].next();
    // this.boardService.update(gameBoard);
    const combination = new Combination(this.size);
    const isWin = (new BitBoard(combination.combinations, this.size, gameBoard)).checkWin(true);
    if (isWin) {
      this.endGame();
    } else {
      this._turn += 1;
      await this.nextTurn();
    }
  }

  endGame() {
    console.log("Player win: " + this.players[this._turn % this.players.length]);
  }

  startGame() {
    this._turn = 0;
    this.boardService.create(this.size);
    this.nextTurn();
  }
}
