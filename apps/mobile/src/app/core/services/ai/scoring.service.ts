import {Injectable} from '@angular/core';
import {BoardBits} from "../board/boardBits";
import {Pattern} from "../board/pattern";
import {ComboNames} from "../board/combination";
import {PatternService} from "../board/pattern.service";

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  findMax;
  findMin;
  findWin;
  findIllegal;
  maxScoreMultiple = 6;

  constructor(private readonly patternService: PatternService) {
    const findPatternsFunc = this.patternService._findPatternsFactory(this.patternService.patterns);
    this.findMax = this.patternService.findMaxPatterns(findPatternsFunc);
    this.findMin = this.patternService.findMinPatterns(findPatternsFunc);
    this.findWin = this.patternService._findPatternsFactory(this.patternService.winPatterns);
    this.findIllegal = this.patternService._findPatternsFactory(this.patternService.capturePatters);
  }

  checkWin(board: BoardBits) {
    return false;
  }

  // @memoize()
  calculate(board: BoardBits): number {
    const maxCombos = this.findMax(board);
    board.patternsBlue = [...maxCombos];
    let score = this.calculateScore(maxCombos);
    if (score < 15000) {
      const minCombos = this.findMin(board);
      board.patternsRed = [...minCombos];
      const minScore = this.calculateScore(minCombos);
      // return maximising ? this.maxScore : this.minScore;
      //TODO: why 1.1&
      // console.log("MAX: ", score, maxCombos, "MIN:", minScore, minCombos);
      score *= this.maxScoreMultiple;
      score -= minScore;
      // console.log(BoardPrinterService.printBitBoard(board.blue, Number(board.size)));
      // console.log(BoardPrinterService.printBitBoard(board.red, Number(board.size)));
      // console.log(score, maxCombos, minCombos)
    }
    return score;
  }

  private calculateScore(combos: Pattern[]): number {
    type Scores = {
      [key in ComboNames]: number;
    };
    const count: Scores = {
      [ComboNames.DUMMY]: 0,
      [ComboNames.FIVE]: 0,
      [ComboNames.OPENFOUR]: 0,
      [ComboNames.CLOSEDFOUR]: 0,
      [ComboNames.OPENTHREE]: 0,
      [ComboNames.CLOSEDTHREE]: 0,
      [ComboNames.OPENTWO]: 0,
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
    if (count[ComboNames.OPENTWO]) {
      score += 100;
    }
    // score += 200 * count[ComboNames.CLOSEDTHREE];
    return score;
  }

}
