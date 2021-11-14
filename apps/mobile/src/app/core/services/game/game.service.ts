import { Injectable } from '@angular/core';
import { GameBoard } from '../ai/ai.service';
import { BoardService } from '../board/board.service';
import { FormGroup } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

export enum PlayerType {
  HUMAN,
  AI,
}

export class Player {
  type: PlayerType;
  workerOrService: any;

  constructor(type: PlayerType, workerOrService: any) {
    this.type = type;
    this.workerOrService = workerOrService;
  }

  // async next(): Promise<GameBoard | null> {
  //   if (this.workerOrService) {
  //     const subscription = this.workerOrService.onMessage();
  //     this.workerOrService.message('getNextActiion');
  //     return subscription;
  //   }
  //   return new Promise(() => null);
  // }
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  size = 19;
  worker?: Worker;
  private _sequence$ = new ReplaySubject<GameBoard>();

  private _turn = 0;

  get turn() {
    return Math.ceil(this._turn / 2);
  }

  sequence$() {
    return this._sequence$.asObservable();
  }

  initGame(settings: FormGroup) {
    this.size = settings.get('size')?.value ?? 19;
    this._sequence$.next({
      id: 0,
      timestamp: 0,
      player: {
        type: settings.get('player')?.value.type,
        map: [],
        options: {
          color: (alpha: number = 1) => 'rgba(69,187,0,' + alpha + ')',
        },
      },
      enemy: {
        type: settings.get('enemy')?.value.type,
        map: [],
        options: {
          color: (alpha: number = 1) => 'rgba(194,6,6,' + alpha + ')',
        },
      },
      size: settings.get('size')?.value ?? 19,
      lastMove: '',
      isPlayer: false,
    });
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
    // players.map((player) => {
    //   if (player === PlayerType.HUMAN) {
    //     // this.players.push(new Player(player, this.drawerDirective));
    //   } else {
    //     this.players.push(new Player(player, this.worker));
    //   }
    // });
  }

  startGame() {
    this._turn = 0;
    // this.boardService.create(this.size);
  }

  makeTurn(board: GameBoard) {
    console.log(board);
    this._sequence$.next(board);
  }
}
