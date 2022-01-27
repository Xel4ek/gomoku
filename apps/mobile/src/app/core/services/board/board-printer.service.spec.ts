import { TestBed } from '@angular/core/testing';

import { BoardPrinterService } from './board-printer.service';

export enum Side {
  PLAYER,
  ENEMY
}

/**
 * Flip, mirror or reverse a bitboard
 * @param x any bitboard
 * @param flip the bitboard
 * @param mirror the bitboard
 * @return bitboard x flipped, mirrored or reversed
 */
// function flipMirrorOrReverse(x: bigint, flip: boolean, mirror: boolean) {
//   for (let i = 3 * (1 - (+ mirror)); i < 3 * (1 + (+flip)); i++) {
//     const s = 1n << i;
//     const f = 1 << s;
//     const k = -1 / (f + 1);
//     x = ((x >> BigInt(s)) & BigInt(k)) + BigInt(f) * (x & BigInt(k));
//   }
//   return x;
// }

describe('BoardPrinterService', () => {
  let service: BoardPrinterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardPrinterService);
  });

  /**
   * Pseudo rotate a bitboard 45 degree clockwise.
   * Main Diagonal is mapped to 1st rank
   * @param x any bitboard
   * @return bitboard x rotated
   */

});
