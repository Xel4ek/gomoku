import { Injectable } from '@angular/core';
import { AiService, GameBoard } from "./ai/ai.service";
import { DrawerDirective } from "../directives/drawer/drawer.directive";
import { LocalStorageService } from "./local-storage/local-storage.service";
import { BitBoard } from "./bit-board";

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
    this.workerOrService.message("getNextAction");
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
              private readonly localStorageService: LocalStorageService) {
  }

  initGame(size: number = 19, players: PlayerType[]) {
    this.size = size;
    if (this.worker) {
      //TODO: delete existing worker before init
    }
    this.worker = new Worker("");
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
    this.localStorageService.addMessage(gameBoard);
    const isWin = (new BitBoard(this.size, gameBoard)).checkWin(true);
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
    this.nextTurn();
  }
}
