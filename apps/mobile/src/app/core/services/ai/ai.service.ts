import { Injectable, NgZone } from '@angular/core';
import { BitBoard } from '../board/bit-board';
import { GameService, PlayerType } from '../game/game.service';
import { filter, tap } from "rxjs/operators";
import { BoardService } from "../board/board.service";

export enum AI {
  SIMPLE,
}

//TODO: Check score calculation (may be wrong shift to N, NW, NE)
//TODO: place AI to worker
//TODO: remove forbidden moves
//TODO: add scoring of capture moves, or may be not (static eval will be enough)

interface AiStatistics {
  [key: string]: unknown;
}

export interface Player {
  type: PlayerType;
  map: number[];
  turn: number[];
  captured: number;
  options: {
    color: (opacity?: number) => string;
    deep: number;
  };
}

export interface GameBoard {
  id: number;
  timestamp: number;
  player: Player;
  enemy: Player;
  blocked: number[];
  size: number;
  stat?: AiStatistics;
  winner?: {
    color: (opacity?: number) => string;
    combination: number[];
  };
}

@Injectable({
  providedIn: 'root',
})
// TODO: move this services to worker

export class AiService {
  depth = 3;
  //TODO: add time limit
  timeLimit = 500; //milliseconds
  winCount = 5;
  size = 19;

  constructor(
    private readonly gameService: GameService,
    private readonly boardService: BoardService,
    private readonly zone: NgZone
  ) {

    // const worker = new Worker('');
    const subscriber = gameService.sequence$()
      .pipe(
        filter(data => data.id % 2 ? data.enemy.type === PlayerType.AI : data.player.type === PlayerType.AI),
        tap(data => {
          console.log('From sequence ', data);
          const start = new Date().getTime();
          const onmessage = (turn: number) => {
            console.log('AI moved ', turn, (new Date().getTime() - start) / 1000);
            const turnsMap = data.id % 2 ? data.enemy.map : data.player.map;
            turnsMap.push(turn);
            this.gameService.makeTurn(data);
            // worker.onmessage = tu;
          };
          this.zone.runOutsideAngular(() => {
            this.getNextAction(this.boardService.createFromGameBoard({ ...data }), onmessage);
          });
          // this.mockAction('', onmessage);
        }))
      .subscribe();
    // TODO: Subscribe to messages
  }

  mockAction(dummy: string, callback: (turn: number) => void) {
    callback(Math.trunc(Math.random() * 19 * 19));
    console.log("AI return number");
  }

  getNextAction(board: BitBoard, callback: (turn: number) => void): void {
    // console.log(board);
    board.score = this.minimax(
      board,
      this.depth,
      false,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    // console.log(board.possibleActions);
    if (board.possibleActions.length > 0) {
      const action = board.possibleActions.reduce(
        (previousValue, currentValue) => {
          return previousValue.score < currentValue.score
            ? previousValue
            : currentValue;
        }
      );
      //TODO: refactor turn
      board.move(action.col, action.row, 'enemy');
      // console.log(action);
      callback(action.row * this.size + action.col);
      return;
    }
    callback(-1);
    return;
  }

  eval(
    isMax: boolean,
    board: BitBoard,
    depth: number,
    alpha: number,
    beta: number
  ) {
    let evalScore = isMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    for (const action of board.possibleActions) {
      // console.log(`${depth}: ${isMax} ${action.row} - ${action.col}, score: ${action.score}`);
      const newBoard = board.clone();
      newBoard.move(action.col, action.row, isMax ? 'player' : 'enemy');
      action.score = this.minimax(newBoard, depth - 1, !isMax, alpha, beta);
      evalScore = isMax
        ? Math.max(evalScore, action.score)
        : Math.min(evalScore, action.score);
      // console.log(`${depth}: ${isMax} ${action.row} - ${action.col}, score: ${action.score}`);
      // console.log('max: ', oldMax, action.score, ' -> ', maxEval);
      if (isMax) {
        alpha = Math.max(alpha, action.score);
      } else {
        beta = Math.min(beta, action.score);
      }
      if (beta <= alpha) {
        // console.log(isMax + ' pruned!');
        break;
      }
    }
    return evalScore;
  }

  minimax(
    board: BitBoard,
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    board.generateActions();
    // console.log("isMax: " + maximizing, board.possibleActions);
    // console.log(BitBoard.printBitBoard(board.boards.player, board.size));
    if (
      depth === 0 ||
      board.checkWin(maximizing) ||
      board.possibleActions.length === 0
    ) {
      // console.log(
      //   'Depth 0. Score: ' + score,
      //   'WIN: ' + board.checkWin(maximizing),
      //   'Actions :' + board.possibleActions.length
      // );
      // console.log(BitBoard.printBitBoard(board.boards.player, board.size));
      // console.log(BitBoard.printBitBoard(board.boards.enemy, board.size));
      return board.updateScore();
    }
    return this.eval(maximizing, board, depth, alpha, beta);
  }
}
