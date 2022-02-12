import { Injectable } from '@angular/core';
import { Combo, ComboNames } from "../board/combination";
import { Action } from "./action";
import { BitBoard, DirectionNew } from "../board/bit-board";
import { BoardBits } from "../board/boardBits";
import { BoardService } from "../board/board.service";
import { PatternService } from "../board/pattern.service";
import { Pattern } from "../board/pattern";
import { Board } from "../board/board";

export enum Side {
  PLAYER,
  ENEMY
}

@Injectable({
  providedIn: 'root'
})

export class ActionService {

  //TODO: refactor
  size = 19;

  shift = {
    E: 1n,
    N: BigInt(this.size) + 1n,
    NE: BigInt(this.size) + 1n + 1n,
    NW: BigInt(this.size) + 1n - 1n,
    S: -(BigInt(this.size) + 1n),
    SE: -(BigInt(this.size) + 1n) + 1n,
    SW: -(BigInt(this.size) + 1n) - 1n,
    W: -1n,
  };

  constructor(private readonly patternService: PatternService) {
  }

  generateActions(board: BoardBits, dilation: number = 1): Action[] {
    const actions: Action[] = [];
    const occupied = board.red | board.blue;
    let moves = occupied;
    for (let i = dilation; i > 0; i--) {
      const empty = ~board.border;
      moves = moves
        | (moves >> this.shift.S & empty)
        | (moves >> this.shift.N & empty)
        | (moves >> this.shift.E & empty)
        | (moves >> this.shift.NE & empty)
        | (moves >> this.shift.SE & empty)
        | (moves >> this.shift.NW & empty)
        | (moves >> this.shift.SW & empty)
        | (moves >> this.shift.W & empty);
    }
    moves ^= occupied;
    let i = 0;
    while (moves) {
      if (moves & 1n) {
        actions.push(
          new Action(i % (Number(board.size) + 1), Number(Math.floor(i / (Number(board.size) + 1))))
          // new Action(Number(board.size), i % (Number(board.size) + 1), Number(Math.floor(i / (Number(board.size) + 1))))
        );
      }
      moves >>= 1n;
      i++;
    }
    return actions;
  }

  updateScore(board: BoardBits, side: Side) {
    const maxCombos = this.patternService.findPatterns(board.red, board.blue, board.border);
    const minCombos = this.patternService.findPatterns(board.blue, board.red, board.border);
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

  checkWin(board: BoardBits, side: Side) {
    const len: number[] = [];
    [DirectionNew.E, DirectionNew.S, DirectionNew.SE, DirectionNew.SW].forEach((value) => {
      let length = 0;
      let bits = side ? board.red : board.blue;
      while (bits) {
        bits &= bits >> this.shift[value];
        length++;
      }
      len.push(length);
    });
    return Math.max(...len) >= 5;
  }

}
