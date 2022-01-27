import { TestBed } from '@angular/core/testing';

import { BitBoardServiceService } from './bit-board-service.service';
import { BoardPrinterService } from "./board-printer.service";

describe('BitBoardServiceService', () => {
  let service: BitBoardServiceService;
  let printer: BoardPrinterService;
  let size = 6;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    printer = TestBed.inject(BoardPrinterService)
    service = new BitBoardServiceService(size);
  });

  it('should be created', () => {
    const border = service.createEmpty().border;
    console.log(printer.printBitBoard(border, Number(service.size)));
    console.log(printer.printBitBoard(service.flipVertical64(border), Number(service.size)));
    expect(service).toBeTruthy();
  });

  it('should test flipMirrorOrReverse 8x8', () => {
    const board = service.createEmpty()
    size = 8;
    board.border = BigInt("0b" +
      "11111111" +
      "10000001" +
      "10100001" +
      "10000001" +
      "10000001" +
      "10000001" +
      "10001101" +
      "11111111"
    );
    console.log(printer.printBitBoard(board.border, Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, true, false), Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, false, true), Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, true, true), Number(size)));
  });

  it('should test flipMirrorOrReverse 10x10', () => {
    const board = service.createEmpty()
    const size = 10;
    board.border = BigInt("0b" +
      "1111111111" +
      "1000000001" +
      "1000000001" +
      "1000000001" +
      "1000000001" +
      "1000000001" +
      "1000000001" +
      "1000000001" +
      "1000000001" +
      "1111111111"
    );
    console.log(printer.printBitBoard(board.border, Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, true, false), Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, false, true), Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, true, true), Number(size)));
  });

  it('should test flipMirrorOrReverse 16x16', () => {
    const size = 16;
    service = new BitBoardServiceService(size);
    const board = service.createEmpty()
    board.border = BigInt("0b" +
      "1111111111111111" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1000000000000001" +
      "1111111111111111"
    );
    console.log(printer.printBitBoard(board.border, Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, true, false), Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, false, true), Number(size)));
    console.log(printer.printBitBoard(service.flipMirrorOrReverse(board.border, true, true), Number(size)));
  });

  it('should flip bitboard vertical', () => {
    const board = service.createEmpty()
    board.border = BigInt("0b" +
      "11111111" +
      "10000001" +
      "10100001" +
      "10000001" +
      "10000001" +
      "10000001" +
      "10001101" +
      "11111111"
    );
    console.log(printer.printBitBoard(board.border, Number(8)));
    console.log(printer.printBitBoard(service.flipVertical64(board.border), Number(8)));
    console.log(printer.printBitBoard(service.flipVertical(board.border), Number(8)));
    expect(service).toBeTruthy();
  });

  it('should swap even and odd bits', () => {
    const border = service.createEmpty().border;
    console.log(printer.printBitBoard(service.deltaSwap(border, 0x5555555555555n, 1n), Number(service.size)));
    const swapped = service.deltaSwap(border, 0b11000001100000000000000n, 2n);
    console.log(printer.printBitBoard(service.deltaSwap(border, 0b11000001100000000000000n, 2n), Number(service.size)));
  });

  it('should return kMask', () => {
    const size = 64n
    for (let i = 0n; size >> i; i++) {
      console.log(service.kMaskFiles(64n, i).toString(2));
      }
  });

  it('should rotate 45 8x8', () => {
    size = 8;
    service = new BitBoardServiceService(size);
    const board = service.createEmpty();
    board.red = BigInt("0b" +
      "10001000" +
      "01000100" +
      "00100010" +
      "00010001" +
      "00001000" +
      "00000100" +
      "00000010" +
      "00000001"
    );
    expect(printer.printBitBoard(service.pseudoRotate45clockwise(board.red, size * size), size)).toEqual(
      "11111111\n" +
      "........\n" +
      "........\n" +
      "........\n" +
      "1111"
    )
  });

  it('should rotate any size 45 8x8', () => {
    size = 8;
    service = new BitBoardServiceService(6);
    const board = service.createEmpty();
    board.red = BigInt("0b" +
      "10001000" +
      "01000100" +
      "00100010" +
      "00010001" +
      "00001000" +
      "00000100" +
      "00000010" +
      "00000001"
    );
    expect(printer.printBitBoard(service.pseudoRotate45clockwiseAnySize(board.red, size * size), size)).toEqual(
      "11111111\n" +
      "........\n" +
      "........\n" +
      "........\n" +
      "1111"
    )
  });

  it('should rotate any size 45 8x8', () => {
    size = 8;
    service = new BitBoardServiceService(6);
    const board = service.createEmpty();
    board.red = BigInt("0b" +
      "10001000" +
      "01000100" +
      "00100010" +
      "00010001" +
      "00001000" +
      "00000100" +
      "00000010" +
      "00000001"
    );
    expect(printer.printBitBoard(service.pseudoRotate45clockwiseAnySize(board.red, size * size), size)).toEqual(
      "11111111\n" +
      "........\n" +
      "........\n" +
      "........\n" +
      "1111"
    )
  });

  it('should rotate anticlockwise any size 45 16x16', () => {
    size = 16;
    service = new BitBoardServiceService(14);
    const board = service.createEmpty();
    board.red = BigInt("0b" +
      "1000100000000000" +
      "0100010000000000" +
      "0010001000000000" +
      "0001000100000000" +
      "0000100010000000" +
      "0000010001000000" +
      "0000001000100000" +
      "0000000100010000" +
      "0000000010001000" +
      "0000000001000100" +
      "0000000000100010" +
      "0000000000010001" +
      "0000000000001000" +
      "0000000000000100" +
      "0000000000000010" +
      "0000000000000001"
    );
    expect(printer.printBitBoard(service.pseudoRotate45clockwiseAnySize(board.red, size * size), size)).toEqual(
      "1111111111111111\n" +
      "................\n" +
      "................\n" +
      "................\n" +
      "111111111111"
    )
  });

  it('should rotate anticlockwise any size 45 32x32', () => {
    size = 32;
    service = new BitBoardServiceService(30);
    const board = service.createEmpty();
    const row = BigInt("0b00000000000000000000000000000011");
    for (let i = 0n; i < 32n; i++) {
      board.red |= row << (i * BigInt(size + 1));
    }
    board.red = BigInt.asUintN(size * size, board.red);
    expect(printer.printBitBoard(service.pseudoRotate45clockwiseAnySize(board.red, size * size), size)).toEqual(
      "11111111111111111111111111111111\n" +
      "................................\n".repeat(30) +
      ".1111111111111111111111111111111"
    )
  });

  it('should return kMask 0', () => {
    console.log(printer.printBitBoard(service.kMaskRanks(9n, 0n), 9));
  });

  it('should be created', () => {
    let board: bigint;
    let size: number;
    board = BigInt("0b" +
      "11111111" +
      "10000001" +
      "10100001" +
      "10000001" +
      "10000001" +
      "10000001" +
      "10000001" +
      "11111111"
    );
    board = BigInt("0b" +
      "10101010" +
      "01010101" +
      "10101010" +
      "01010101" +
      "10101010" +
      "01010101" +
      "10101010" +
      "01010101"
    );
    board = BigInt("0b" +
      "100010000" +
      "010001000" +
      "001000100" +
      "000100010" +
      "000010001" +
      "000001000" +
      "000000100" +
      "000000010" +
      "000000001"
    );
    size = 9;
    // board = BigInt("0b" +
    //   "1000100000" +
    //   "0100010000" +
    //   "0010001000" +
    //   "0001000100" +
    //   "0000100010" +
    //   "0000010001" +
    //   "0000001000" +
    //   "0000000100" +
    //   "0000000010" +
    //   "0000000001"
    // );
    // size = 10;
    // board = BigInt("0b" +
    //   "00000001" +
    //   "00000010" +
    //   "00000100" +
    //   "00001000" +
    //   "00010000" +
    //   "00100000" +
    //   "01000000" +
    //   "10000000"
    // );
    board = BigInt("0b" +
      "1000100000000000" +
      "0100010000000000" +
      "0010001000000000" +
      "0001000100000000" +
      "0000100010000000" +
      "0000010001000000" +
      "0000001000100000" +
      "0000000100010000" +
      "0000000010001000" +
      "0000000001000100" +
      "0000000000100010" +
      "0000000000010001" +
      "0000000000001000" +
      "0000000000000100" +
      "0000000000000010" +
      "0000000000000001"
    );
    size = 16;
    // console.log(service.printBitBoard(BigInt.asUintN(size * size, -1n) / 17n, size));
    const k1 = BigInt.asUintN(size * size, 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAn);
    const k2 = BigInt.asUintN(size * size, 0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCn);
    const k4 = BigInt.asUintN(size * size, 0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0n);
    const k8 = BigInt.asUintN(size * size, 0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00n);
    console.log(printer.printBitBoard(k1, size));
    console.log(printer.printBitBoard(k2, size));
    console.log(printer.printBitBoard(k4, size));
    console.log(printer.printBitBoard(k8, size));
    // console.log(printer.printBitBoard(pseudoRotate45antiClockwise(board, size * size), size));
    console.log(printer.printBitBoard(service.pseudoRotate45clockwise(board, size * size), size));
    expect(service).toBeTruthy();
  });

});
