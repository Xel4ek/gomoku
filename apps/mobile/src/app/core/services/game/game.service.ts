import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { GameBoard } from '../../interfaces/gameBoard';
import { SimpleAiService } from '../simple-ai/simple-ai.service';

@Injectable({
  providedIn: 'root',
})
export class GameService implements OnDestroy {
  size = 19;
  readonly destroy$ = new Subject<void>();
  private readonly _sequence$ = new ReplaySubject<GameBoard>(1);

  private _turn = 0;
  private aiService: SimpleAiService;
  constructor() {
    this.aiService = new SimpleAiService(this);
  }
  get turn() {
    return Math.ceil(this._turn / 2);
  }

  sequence$() {
    return this._sequence$.asObservable().pipe(
      takeUntil(this.destroy$),
      map((data) => {
        const playerWin = this.hasWin(data.player.map, data.size);
        if (playerWin || data.enemy.captured >= 5) {
          data.winner = {
            color: () => data.player.color + '1)',
            combination: playerWin ?? [],
          };
        }
        const enemyWin = this.hasWin(data.enemy.map, data.size);
        if (enemyWin || data.player.captured >= 5) {
          data.winner = {
            color: () => data.enemy.color + '1)',
            combination: enemyWin ?? [],
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
  initGame(settings: FormGroup) {
    this.size = settings.get('size')?.value ?? 19;
    this._sequence$.next({
      id: 0,
      timestamp: 0,
      player: {
        type: settings.get('player')?.value.type,
        map: [],
        turn: [],
        captured: 0,
        color: 'rgba(3,0,187,', //(alpha: number = 1) => 'rgba(3, 0,187,' + alpha + ')',
        options: {
          deep: settings.get('playerDeep')?.value ?? 0,
        },
      },
      enemy: {
        type: settings.get('enemy')?.value.type,
        map: [],
        turn: [],
        captured: 0,
        color: 'rgba(194,6,6,', //(alpha: number = 1) => 'rgba(194,6,6,' + alpha + ')',
        options: {
          deep: settings.get('enemyDeep')?.value ?? 0,
        },
      },
      size: settings.get('size')?.value ?? 19,
      blocked: [],
    });
    // this.aiService?.destroy();
  }

  startGame() {
    this._turn = 0;
  }

  makeTurn(board: GameBoard) {
    ++board.id;
    const player = board.id % 2 ? board.player.map : board.enemy.map;
    const enemy = board.id % 2 ? board.enemy.map : board.player.map;
    const toRemove = this.findCaptures([player, enemy]);
    board.id % 2
      ? board.player.turn.push(board.id)
      : board.enemy.turn.push(board.id);
    if (toRemove.length) {
      const key: keyof GameBoard = board.id % 2 ? 'enemy' : 'player';
      board[key].map = board[key].map.filter(
        (_, index) => !toRemove.includes(index)
      );
      board[key].turn = board[key].turn.filter(
        (_, index) => !toRemove.includes(index)
      );
      board[key].captured += toRemove.length / 2;
    }
    // console.log(toRemove);

    this._sequence$.next(board);
  }

  ngOnDestroy(): void {
    this._sequence$?.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.aiService.destroy();
  }
}
