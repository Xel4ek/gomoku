import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BitBoard } from './bit-board';
import { Combination } from './combination';
import { GameBoard } from '../ai/ai.service';
import { GameService, PlayerType } from '../game/game.service';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BoardService implements OnDestroy {
  private destroy$ = new Subject<void>();
  store: BitBoard[] = [];
  currentBoard?: number;
  startTime = 0;

  constructor(private readonly gameService: GameService) {
    this.gameService
      .sequence$()
      .pipe(
        takeUntil(this.destroy$),
        filter((data) =>
          data.id % 2
            ? data.enemy.type === PlayerType.AI
            : data.player.type === PlayerType.AI
        ),
        tap((data) => {
          console.log(data);
          this.startTime = new Date().getTime();
          // call ai here send data to worker
        })
      )
      .subscribe();
    // тут подписаться на сообжение воркера посчитать время работы и вызвать метод
    // gameService.makeTurn и передать туда борт
  }
  load(id: number) {
    this.currentBoard = id;
  }

  save() {
    throw 'Not implemented';
  }

  create(size: number) {
    const combos = new Combination(size);
    const board = new BitBoard(combos.combinations, size);
    this.currentBoard = this.store.push(board);
    board.move(Math.floor(size / 2), Math.floor(size / 2), 'player');
  }

  createFromGameBoard(gameBoard: GameBoard) {
    //TODO; move combination to gameService
    const combos = new Combination(gameBoard.size);
    return new BitBoard(combos.combinations, undefined, gameBoard);
  }

  update(board: BitBoard) {
    if (this.currentBoard) {
      this.store[this.currentBoard] = board;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
