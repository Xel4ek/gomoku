import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BitBoard, InvalidMoveError } from './bit-board';
import { Combination } from './combination';
import { GameService, PlayerType } from '../game/game.service';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { BoardBits } from "./boardBits";
import { GameBoard } from "../../interfaces/gameBoard";

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

  createBoard(size: number): BoardBits {
    return new BoardBits(BigInt(size), 0n, 0n, BigInt(
      '0b' + ('0' + '1'.repeat(size)).repeat(size) + '0'));
  }

  move(board: BoardBits, col: number, row: number, turn: 'red' | 'blue') {
    if (col >= board.size || row >= board.size || col < 0 || row < 0) {
      throw new InvalidMoveError(`Cell out of board`);
    }
    const shift = BigInt(row * (Number(board.size) + 1) + col + 1);
    const moveMask = 1n << shift;
    if (board.red & moveMask || board.blue & moveMask || board.border & moveMask) {
      throw new InvalidMoveError(`Cell occupied`);
    }
    board[turn] |= moveMask;
  }


  create(size: number) {
    const combos = new Combination(size);
    const board = new BitBoard(combos.combinations, size);
    this.currentBoard = this.store.push(board);
    board.move(Math.floor(size / 2), Math.floor(size / 2), 'player');
  }

  createFromGameBoard1<A>(gameBoard: GameBoard, c: new() => A): A {
    return new c();
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
