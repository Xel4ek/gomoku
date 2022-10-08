import { Injectable } from '@angular/core';
import { BitBoardService, Orientation } from "./bit-board.service";
import { BoardBits } from "./boardBits";
import { GameBoard } from "../../interfaces/gameBoard";

@Injectable({
  providedIn: 'root'
})
export class BoardPrinterService {

  constructor() {
  }

  static printBitBoardSelectedBoards(board: BoardBits): number[] {
    let idx = board.selectedBoardIndex;
    const arr = [];
    while (!Number.isNaN(idx)) {
      arr.push(idx);
      board = board.childBoards[board.selectedBoardIndex];
      idx = board.selectedBoardIndex;
    }
    return arr;
  }

  static joinBitBoard(board: BoardBits) {
    return BoardPrinterService.joinBoards(
      BoardPrinterService.printBitBoard(board.blue, Number(board.size)),
      BoardPrinterService.printBitBoard(board.red, Number(board.size)),
    );
  }

  static joinBoards(blue: string, red: string): string {
    const arrRed = red.split("")
    return blue.split("")
      .map((value, index) => {
          if (value === "1") {
            return "*";
          }
          if (arrRed[index] === "1") {
            return "o";
          }
          return value;
        }
      )
      .join("");
  }

  static printBitBoard(board: bigint, size: number) {
    const str = board.toString(2)
      .split('')
      .map(v => (v === "0" ? "." : v))
      .reverse()
      .map((value, index) => {
        if ((index + 1) % size === 0) {
          value += '\n'
        }
        return value
      })
    return str.join('') + Array.from({length: size * size - str.length})
      .fill('.')
      .map((value, index) => {
        if (index % size === 0) {
          value += '\n'
        }
        return value;
      })
      .reverse()
      .join('')
  }

  static printBoardScoresNegamax(gameBoard: GameBoard, board: BoardBits) {
    const report: string[] = [];
    Array.from({length: gameBoard.size}).forEach((_) => {
      Array.from({length: gameBoard.size}).forEach((_) => {
        report.push('.....');
      });
    });
    board.childBoards.forEach((b) => {
      const idx = BitBoardService.getFieldIndex(b.border, b.red ^ board.red);
      b.indexScore[idx] = b.score;
      report[idx] = (b.score).toFixed(3).padStart(5, ' ');
    });
    return Array.from({length: gameBoard.size})
      .reduce((acc: string[]) => {
        const str = report.splice(0, gameBoard.size).join('\t') + '\n\n';
        acc.push(str);
        return acc;
      }, [])
      .join('');
  }

  static printChildScores(board: BoardBits) {
    return board.childBoards.reduce((acc, cur) => acc + ", " + cur.score, "")
  }

  printBitBoardOriented(board: bigint, size: number, orientation: Orientation) {
    if (orientation === Orientation.LEFR) {
      const str = board.toString(2)
        .replaceAll("0", ".")
        .split('')
        .reverse()
        .map((value, index) => {
          if (index > 0 && index % size === 0) {
            value = '\n' + value
          }
          return value
        })
      return str.join('');
    }
    return '';
  }

  print45RotatedBitboard(board: bigint, size: number) {
    const str = board.toString(2)
      .replaceAll("0", ".")
      .split('')
      .reverse()
      .map((value, index) => {
        if (index > 0 && index % size === 0) {
          value = '\n' + value
        }
        return value
      })
    return str.join('');

  }

}
