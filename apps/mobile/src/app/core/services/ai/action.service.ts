import { Injectable } from '@angular/core';
import { ComboNames } from "../board/combination";
import { Action } from "./action";
import { DirectionNew } from "../board/bit-board";
import { BoardBits } from "../board/boardBits";
import { BoardPrinterService } from "../board/board-printer.service";
import { PatternService } from "../board/pattern.service";
import { Pattern } from "../board/pattern";

export enum Side {
  PLAYER,
  ENEMY
}

@Injectable({
  providedIn: 'root'
})

export class ActionService {

  size = 32n;

  //TODO: make function shift with param (border.size)
  shift = {
    E: 1n,
    N: this.size,
    NE: this.size + 1n,
    NW: this.size - 1n,
    S: -this.size,
    SE: -this.size + 1n,
    SW: -this.size - 1n,
    W: -1n,
  };

  constructor(private readonly patternService: PatternService, private readonly boardPrinterService: BoardPrinterService) {
  }

  generateActions(board: BoardBits, dilation: number = 1): Action[] {
    const actions: Action[] = [];
    const occupied = board.red | board.blue;
    let moves = occupied;
    for (let i = dilation; i > 0; i--) {
      moves = moves
        | (moves >> this.shift.S)
        | (moves >> this.shift.N)
        | (moves >> this.shift.E)
        | (moves >> this.shift.NE)
        | (moves >> this.shift.SE)
        | (moves >> this.shift.NW)
        | (moves >> this.shift.SW)
        | (moves >> this.shift.W);
    }
    moves = (moves | board.border) ^ board.border;
    let i = 0;
    let border = board.border;
    while (moves) {
      if (moves & 1n) {
        actions.push(
          new Action(board.sizeNumber, i)
          // new Action(i % (Number(board.size)), Number(Math.floor(i / Number(board.size))))
          // new Action(Number(board.size), i % (Number(board.size) + 1), Number(Math.floor(i / (Number(board.size) + 1))))
        );
      }
      moves >>= 1n;
      border >>= 1n;
      if ((border & 1n) === 0n) {
        i++;
      }
    }
    return actions;
  }

  updateScore(board: BoardBits, side: Side) {
    const maxCombos = this.patternService.findMaxPatters(board);
    const minCombos = this.patternService.findMinPatters(board);
    const minScore = this.calculateScore(minCombos);
    const maxScore = this.calculateScore(maxCombos);
    // return maximising ? this.maxScore : this.minScore;
    const score = 1.1 * maxScore - minScore;
    // console.log("updateScore: " + score + ", " + maximising, this.maxCombos, this.minCombos, this.boards.player, this.boards.enemy)
    return score;
  }

  private calculateScore(combos: Pattern[]): number {
    type Scores = {
      [key: number]: number;
    };
    const count: Scores = {
      [ComboNames.FIVE]: 0,
      [ComboNames.OPENFOUR]: 0,
      [ComboNames.CLOSEDFOUR]: 0,
      [ComboNames.OPENTHREE]: 0,
      [ComboNames.CLOSEDTHREE]: 0,
    };
    combos.forEach((value) => {
      count[value.type] += 1;
    });
    let score = 0;
    if (count[ComboNames.FIVE] > 0) {
      score += 100000;
    }
    if (count[ComboNames.OPENFOUR] > 0) {
      // score += 100000;
      score += 15000;
    }
    if (count[ComboNames.OPENTHREE] > 1
      || count[ComboNames.CLOSEDFOUR] > 1
      || (count[ComboNames.CLOSEDFOUR] > 0 && count[ComboNames.OPENTHREE] > 1)
    ) {
      // score += 100000;
      score += 10000;
    }
    if (count[ComboNames.CLOSEDFOUR] > 0 || count[ComboNames.OPENTHREE] > 0) {
      // score += 100000;
      score += 1000;
    }
    if (count[ComboNames.CLOSEDTHREE] > 0) {
      score += 300 * count[ComboNames.CLOSEDTHREE];
    }
    return score;
  }

  checkWin(board: BoardBits, side: 'red' | 'blue') {
    const len: number[] = [];
    [DirectionNew.E, DirectionNew.S, DirectionNew.SE, DirectionNew.SW].forEach((value) => {
      let length = 0;
      let bits = board[side];
      while (bits) {
        bits &= bits >> this.shift[value];
        length++;
      }
      len.push(length);
    });
    return Math.max(...len) >= 5;
  }

}
