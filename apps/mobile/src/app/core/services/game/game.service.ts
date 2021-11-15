import { Injectable, OnDestroy } from '@angular/core';
import { GameBoard } from '../ai/ai.service';
import { FormGroup } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

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
}
@Injectable({
  providedIn: 'root',
})
export class GameService implements OnDestroy {
  size = 19;
  worker?: Worker;
  private readonly destroy$ = new Subject<void>();
  private _sequence$ = new ReplaySubject<GameBoard>();

  private _turn = 0;
  constructor() {
    this._sequence$
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          console.log('player has win: ', this.hasWin(data.player.map));
          console.log('enemy has win: ', this.hasWin(data.enemy.map));
        })
      )
      .subscribe();
  }
  get turn() {
    return Math.ceil(this._turn / 2);
  }

  sequence$() {
    return this._sequence$.asObservable().pipe(
      map((data) => {
        const playerWin = this.hasWin(data.player.map, data.size);
        if (playerWin) {
          data.winner = {
            color: data.player.options.color,
            combination: playerWin,
          };
        }
        const enemyWin = this.hasWin(data.enemy.map, data.size);
        if (enemyWin) {
          data.winner = {
            color: data.enemy.options.color,
            combination: enemyWin,
          };
        }
        return data;
      })
    );
  }
  // TODO we can simplify it
  /**
   * @param board
   * @param size
   * @param length
   */
  private hasWin(board: number[], size = 19, length = 5): number[] | undefined {
    const boardSet = new Set(board);
    for (const index of board) {
      const lookingFor = [1, size - 1, size, size + 1].map((coif) =>
        Array.from({ length: length - 1 }, (_, k) => (k + 1) * coif + index)
      );
      for (const look of lookingFor) {
        if (look.every((item) => boardSet.has(item))) {
          return [index, ...look];
        }
      }
    }
    return undefined;
  }
  private findCaptures(
    [player, enemy]: [number[], number[]],
    size = 19
  ): number[] {
    const toRemove: number[] = [];
    const pivot = player[player.length - 1];
    [-1, 1, size + 1, size, size - 1, -size - 1, -size + 1, -size].map(
      (coif) => {
        if (
          enemy.includes(pivot + coif) &&
          enemy.includes(pivot + 2 * coif) &&
          player.includes(pivot + 3 * coif)
        ) {
          toRemove.push(enemy.indexOf(pivot + coif));
          toRemove.push(enemy.indexOf(pivot + 2 * coif));
        }
      }
    );

    return toRemove;
  }
  private findFreeThrees(gameBoard: GameBoard): GameBoard {
    return gameBoard;
  }
  initGame(settings: FormGroup) {
    this.size = settings.get('size')?.value ?? 19;
    this._sequence$.next({
      id: 0,
      timestamp: 0,
      player: {
        type: settings.get('player')?.value.type,
        map: [],
        turn: [],
        options: {
          color: (alpha: number = 1) => 'rgba(3, 0,187,' + alpha + ')',
          deep: settings.get('playerDeep')?.value ?? 0,
        },
      },
      enemy: {
        type: settings.get('enemy')?.value.type,
        map: [],
        turn: [],
        options: {
          color: (alpha: number = 1) => 'rgba(194,6,6,' + alpha + ')',
          deep: settings.get('enemyDeep')?.value ?? 0,
        },
      },
      size: settings.get('size')?.value ?? 19,
      blocked: [],
    });
  }

  startGame() {
    this._turn = 0;
  }

  makeTurn(board: GameBoard) {
    const player = board.id % 2 ? board.player.map : board.enemy.map;
    const enemy = board.id % 2 ? board.enemy.map : board.player.map;
    const toRemove = this.findCaptures([player, enemy]);
    board.id % 2
      ? board.player.turn.push(board.id)
      : board.enemy.turn.push(board.id);
    if (toRemove.length) {
      if (board.id % 2) {
        board.enemy.map = board.enemy.map.filter(
          (_, index) => !toRemove.includes(index)
        );
        board.enemy.turn = board.enemy.turn.filter(
          (_, index) => !toRemove.includes(index)
        );
      } else {
        board.player.map = board.player.map.filter(
          (_, index) => !toRemove.includes(index)
        );
        board.player.turn = board.player.turn.filter(
          (_, index) => !toRemove.includes(index)
        );
      }
    }
    console.log(toRemove);

    this._sequence$.next(board);
  }

  ngOnDestroy(): void {
    this._sequence$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
