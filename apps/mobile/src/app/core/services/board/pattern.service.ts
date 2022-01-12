import { Injectable } from '@angular/core';
import { Pattern } from "./pattern";
import { ComboNames, Dir } from "./combination";
import { RotatedPattern } from "./rotated-pattern";
import { Board } from "./board";

@Injectable({
  providedIn: 'root'
})
export class PatternService {
  size: number;
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

  constructor(size: number) {
    this.size = size;
    this.templatePatterns.forEach(t => {
      const p = new Pattern(
        t.name,
        t.type,
        t.player,
        t.enemy,
        t.empty,
      );
      this.patterns.push(p);
      this.rotatePattern(p);
    });
    this.patterns.sort(p => p.type);
  }


  private rotateField(pattern: bigint, length: number, direction: Dir): bigint {
    let rotatedMask = 0n;
    let num = 0;
    while (pattern) {
      if (pattern & 1n) {
        switch (direction) {
          case Dir.S: {
            rotatedMask |= 1n << BigInt(num * (this.size + 1));
            break;
          }
          case Dir.SE: {
            rotatedMask |= 1n << BigInt(num * (this.size + 1) + num);
            break;
          }
          case Dir.SW: {
            rotatedMask |= 1n << BigInt(num * (this.size + 1) + (length - num - 1));
            break;
          }
        }
      }
      pattern >>= 1n;
      num++;
    }
    return rotatedMask;
  }

  private rotatePattern(p: Pattern) {
    [Dir.SW, Dir.SE, Dir.S].forEach(direction => {
      this.patterns.push(new RotatedPattern(
        this.size,
        p.name,
        p.type,
        this.rotateField(p.player, p.length, direction),
        this.rotateField(p.enemy, p.length, direction),
        this.rotateField(p.empty, p.length, direction),
      ));
      //TODO: check rotation of new masks - size may be wrong
    });
  }

  findPatterns(board: Board, side: "player" | "enemy"): Pattern[] {
    let player = side === "player" ? board.player : board.enemy;
    let enemy = side === "player" ? board.enemy : board.player;
    let border = board.border;
    const selected: Pattern[] = [];
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
    return selected;
  }

}
