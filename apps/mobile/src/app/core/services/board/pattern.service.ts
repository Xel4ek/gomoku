import {Inject, Injectable} from '@angular/core';
import {Pattern} from "./pattern";
import {ComboNames, Dir} from "./combination";
import {RotatedPattern} from "./rotated-pattern";
import {BoardBits, Field} from "./boardBits";
import {Side} from "../ai/action.service";
import counter from "@nrwl/workspace/src/executors/counter/counter.impl";
import {BitBoardService} from "./bit-board.service";

@Injectable({
  providedIn: 'root'
})
export class PatternService {
  patterns: Pattern[] = [];
  templatePatterns = [
    {
      name: "Open Five",
      type: ComboNames.FIVE,
      player: 0b11111n,
      empty: 0n,
      enemy: 0n,
    },
    {
      name: "Open Four",
      type: ComboNames.OPENFOUR,
      player: 0b011110n,
      empty: 0b100001n,
      enemy: 0n,
    },
    {
      name: "Closed Four 1",
      type: ComboNames.CLOSEDFOUR,
      player: 0b011110n,
      empty: 0b100000n,
      enemy: 1n,
    },
    {
      name: "Closed Four 11",
      type: ComboNames.CLOSEDFOUR,
      player: 0b011110n,
      empty: 1n,
      enemy: 0b100000n,
    },
    {
      name: "Closed Four 3",
      type: ComboNames.CLOSEDFOUR,
      player: 0b11011n,
      empty: 0b100n,
      enemy: 0n,
    },
    {
      name: "Closed Four 4",
      type: ComboNames.CLOSEDFOUR,
      player: 0b11101n,
      empty: 0b10n,
      enemy: 0n,
    },
    {
      name: "Closed Four 5",
      type: ComboNames.CLOSEDFOUR,
      player: 0b10111n,
      empty: 0b1000n,
      enemy: 0n,
    },
    {
      name: "Open Three 1",
      type: ComboNames.OPENTHREE,
      player: 0b01110n,
      empty: 0b10001n,
      enemy: 0b0n,
    },
    {
      name: "Open Three 21",
      type: ComboNames.OPENTHREE,
      player: 0b010110n,
      empty: 0b10001n,
      enemy: 0b100000n,
    },
    {
      name: "Open Three 22",
      type: ComboNames.OPENTHREE,
      player: 0b010110n,
      empty: 0b101000n,
      enemy: 1n,
    },
    {
      name: "Open Three 31",
      type: ComboNames.OPENTHREE,
      player: 0b011010n,
      empty: 0b100100n,
      enemy: 1n,
    },
    {
      name: "Open Three 32",
      type: ComboNames.OPENTHREE,
      player: 0b011010n,
      empty: 0b101n,
      enemy: 0b100000n,
    },
    {
      name: "Closed Three 1",
      type: ComboNames.CLOSEDTHREE,
      player: 0b001110n,
      empty: 0b110000n,
      enemy: 0b000001n,
    },
    {
      name: "Closed Three 2",
      type: ComboNames.CLOSEDTHREE,
      player: 0b011100n,
      empty: 0b11n,
      enemy: 0b100000n,
    },
  ];

  counter = 0;

  constructor(private readonly bitBoardService: BitBoardService) {
    this.templatePatterns.forEach(t => {
      const p = new Pattern(
        t.name,
        t.type,
        t.player,
        t.enemy,
        t.empty,
      );
      this.patterns.push(p);
      // this.rotatePattern(p);
    });
    this.patterns.sort(p => p.type);
  }


  // private rotateField(pattern: bigint, length: number, direction: Dir): bigint {
  //   let rotatedMask = 0n;
  //   let num = 0;
  //   while (pattern) {
  //     if (pattern & 1n) {
  //       switch (direction) {
  //         case Dir.S: {
  //           rotatedMask |= 1n << BigInt(num * (this.size + 1));
  //           break;
  //         }
  //         case Dir.SE: {
  //           rotatedMask |= 1n << BigInt(num * (this.size + 1) + num);
  //           break;
  //         }
  //         case Dir.SW: {
  //           rotatedMask |= 1n << BigInt(num * (this.size + 1) + (length - num - 1));
  //           break;
  //         }
  //       }
  //     }
  //     pattern >>= 1n;
  //     num++;
  //   }
  //   return rotatedMask;
  // }
  //
  // private rotatePattern(p: Pattern) {
  //   [Dir.SW, Dir.SE, Dir.S].forEach(direction => {
  // this.patterns.push(new RotatedPattern(
  //   this.size,
  //   p.name,
  //   p.type,
  // this.rotateField(p.player, p.length, direction),
  // this.rotateField(p.enemy, p.length, direction),
  // this.rotateField(p.empty, p.length, direction),
  // ));
  // TODO: check rotation of new masks - size may be wrong
  // });
  // }

  //TODO: 1. Подключить поиск диагональных и вертикальных паттернов - возможна оптимизация по быстрому поиску
  //TODO: 2. Ограничить область поиска паттернов областью вокруг новой точки с кешированием ранее найденных паттернов

  rotateBoard(board: BoardBits): BoardBits[] {
    const boards = [board];
    const board45CW = board.clone();
    board45CW.red = this.bitBoardService.pseudoRotate45clockwiseAnySize(board45CW.red, board.sizeNumber * board.sizeNumber);
    board45CW.blue = this.bitBoardService.pseudoRotate45clockwiseAnySize(board45CW.blue, board.sizeNumber *  board.sizeNumber);
    board45CW.border = this.bitBoardService.pseudoRotate45clockwiseAnySize(board45CW.border, board.sizeNumber *  board.sizeNumber);

    const board45ACW = board.clone();
    board45ACW.red = this.bitBoardService.pseudoRotate45AnticlockwiseAnySize(board45ACW.red, board.sizeNumber *  board.sizeNumber);
    board45ACW.blue = this.bitBoardService.pseudoRotate45AnticlockwiseAnySize(board45ACW.blue, board.sizeNumber *  board.sizeNumber);
    board45ACW.border = this.bitBoardService.pseudoRotate45AnticlockwiseAnySize(board45ACW.border, board.sizeNumber *  board.sizeNumber);

    const board90 = board.clone();
    board90.red = this.bitBoardService.rotate90antiClockwise(board90.red);
    board90.blue = this.bitBoardService.rotate90antiClockwise(board90.blue);
    board90.border = this.bitBoardService.rotate90antiClockwise(board90.border);
    boards.push(board45CW, board45ACW, board90);

    return boards;
  }

  findMaxPatters(board: BoardBits): Pattern[] {
    const patters = [];
    const boards = this.rotateBoard(board);
    for (const brd of boards) {
      patters.push(...this.findPatterns(brd.blue, brd.red, brd.border));
    }
    console.log(boards);
    return patters;
  }

  findMinPatters(board: BoardBits): Pattern[] {
    const patters = [];
    const boards = this.rotateBoard(board);
    for (const brd of boards) {
      patters.push(...this.findPatterns(brd.red, brd.blue, brd.border));
    }
    return patters;
  }

  findPatterns(player: bigint, enemy: bigint, border: bigint): Pattern[] {
    const selected = [];
    // while (((player | enemy) & 1n) === 0n) {
    //   player >>= 1n;
    //   enemy >>= 1n;
    //   border >>= 1n;
    // }
    while (player) {
      const pattern = this.patterns.find(p => {
        this.counter++;
        if ((player & p.player) === p.player
          && ((player | enemy) & p.empty) === 0n
          && ((enemy & p.enemy) === p.enemy
            || (border & p.enemy) === p.enemy)) {
          //TODO: incorrect shift for rotated patterns -
          if (!(p instanceof RotatedPattern)) {
            player >>= BigInt(p.length);
            enemy >>= BigInt(p.length);
            border >>= BigInt(p.length);
          }
          return true;
        }
        return false;
      });
      if (pattern) {
        selected.push(pattern);
      }
      player >>= 1n;
      enemy >>= 1n;
      border >>= 1n;
    }
    return selected;
  }

  _findPatterns(player: bigint, enemy: bigint, border: bigint): Pattern[] {
    const selected: Pattern[] = [];
    console.log(player);
    console.log(enemy);
    console.log(border);
    while (player) {
      selected.push(...this.patterns.filter(p => {
          if ((player & p.player) === p.player
            && ((player | enemy) & p.empty) === 0n
            && ((enemy & p.enemy) === p.enemy
              || (border & p.enemy) === p.enemy)) {
            //TODO: incorrect shift for rotated patterns -
            if (!(p instanceof RotatedPattern)) {
              player >>= BigInt(p.length);
              enemy >>= BigInt(p.length);
              border >>= BigInt(p.length);
            }
            return true;
          }
          return false;
        })
      );
      player >>= 1n;
      enemy >>= 1n;
      border >>= 1n;
    }
    console.log(selected);
    return selected;
  }

}
