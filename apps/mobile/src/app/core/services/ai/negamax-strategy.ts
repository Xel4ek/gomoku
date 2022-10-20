import { Strategy } from './strategy';
import { BitBoardService } from '../board/bit-board.service';
import { ActionService } from './action.service';
import { LoggerService } from '../logger/logger.service';
import { PatternService } from '../board/pattern.service';
import { BoardBits } from '../board/boardBits';
import { Injectable } from '@angular/core';
import { ScoringService } from "./scoring.service";
import { GameBoard } from "../../interfaces/gameBoard";
import { BoardPrinterService } from "../board/board-printer.service";
import { accDecorator, counterReporter } from "../../tools/performance.decorator";


@Injectable({
  providedIn: 'root',
})
export class NegamaxStrategy implements Strategy {
  depth = 3;

  constructor(
    private readonly scoringService: ScoringService,
    private readonly boardService: BitBoardService,
    private readonly actionService: ActionService,
    private readonly logger: LoggerService,
    private readonly patternService: PatternService
  ) {
  }

  @accDecorator()
  negamax(node: BoardBits, depth: number, alpha: number, beta: number, color: number) {
    if (depth === 0) {
      node.score = color * this.scoringService.evaluateBoard(node, color === 1 ? "red" : "blue");
      return node;
    }
    this.boardService.generateBoards(node, 1, color === 1 ? 'red' : 'blue');
    if (node.childBoards.length === 0) {
      node.score = color * this.scoringService.evaluateBoard(node, color === 1 ? "red" : "blue");
      return node;
    }
    //TODO: implement moves ordering here
    let value = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < node.childBoards.length; i++) {
      const childNode = this.negamax(
        node.childBoards[i],
        depth - 1,
        -beta,
        -alpha,
        -color
      );
      childNode.score = -(isNaN(childNode.score) ? childNode.childBoards[childNode.selectedBoardIndex].score : childNode.score);
      childNode.scoreRed = -(isNaN(childNode.scoreRed) ? childNode.childBoards[childNode.selectedBoardIndex].scoreRed : childNode.scoreRed);
      childNode.scoreBlue = -(isNaN(childNode.scoreBlue) ? childNode.childBoards[childNode.selectedBoardIndex].scoreBlue : childNode.scoreBlue);
      if (childNode.score > value) {
        value = childNode.score;
        node.selectedBoardIndex = i;
      }
      alpha = alpha >= value ? alpha : value;
      if (alpha >= beta) {
        break;
      }
    }
    return node;
  }

  @counterReporter(console.log)
  getNextTurn(gameBoard: GameBoard): number {
    const board = this.boardService.createFromGameBoard(gameBoard);
    const start = performance.now();
    this.patternService.counter = 0;
    // TODO: replace side literal with option
    this.negamax(
      board,
      this.depth,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      1
    );
    const time = performance.now() - start;
    this.logger.log(`
     Depth: ${this.depth}
     Total time negamax: ${time}
     Total calls patternService: ${this.patternService.counter}
    `);
    if (board.childBoards.length > 0 && !isNaN(board.selectedBoardIndex)) {
      const redMoveMask =
        board.childBoards[board.selectedBoardIndex].red ^ board.red;
      // this.logger.log(board);
      this.logger.log('Total time getNextTurn: ' + (performance.now() - start));
      this.logger.log(BoardPrinterService.printBoardScoresNegamax(gameBoard, board));
      return this.boardService.getFieldIndex(board.border, redMoveMask);
    }
    return -1;
  }
}
