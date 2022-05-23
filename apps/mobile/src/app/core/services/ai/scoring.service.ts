import { Injectable } from '@angular/core';
import { BoardBits } from "../board/boardBits";
import { Pattern } from "../board/pattern";
import { ComboNames } from "../board/combination";
import { PatternService } from "../board/pattern.service";

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  constructor(private readonly patternService: PatternService) {
  }

  checkWin(board: BoardBits) {
    return false;
  }

  calculate(board: BoardBits): number {
    const maxCombos = this.patternService.findMaxPatters(board);
    let score = this.calculateScore(maxCombos);
    if (score < 15000) {
      const minCombos = this.patternService.findMinPatters(board);
      const minScore = this.calculateScore(minCombos);
      // return maximising ? this.maxScore : this.minScore;
      //TODO: why 1.1&
      score *= 6;
      score -= minScore;
    }
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
      || (count[ComboNames.CLOSEDFOUR] > 0 && count[ComboNames.OPENTHREE] > 0)
    ) {
      // score += 100000;
      score += 3000;
    }
    if (count[ComboNames.CLOSEDFOUR] > 0 || count[ComboNames.OPENTHREE] > 0) {
      // score += 100000;
      score += 1000;
    }
    if (count[ComboNames.CLOSEDTHREE]) {
      score += 300;
    }
    // score += 200 * count[ComboNames.CLOSEDTHREE];
    return score;
  }

}
