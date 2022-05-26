export enum Dir {
  E,
  S,
  SE,
  SW
}

export enum ComboNames {
  DUMMY,
  FIVE,
  OPENFOUR,
  CLOSEDFOUR,
  OPENTHREE,
  CLOSEDTHREE,
  OPENTWO,
}

export enum BitComparer {
  NONE,
  FILLED,
  OR,
  XOR,
  EMPTY,
  ANY,
}

export class Combo {
  name = "default";
  type = ComboNames.DUMMY;
  maskPlayer = 0n;
  maskOld = 0n;
  maskEmpty = 0n;
  maskEnemy = 0n;
  maskBorder = 0n;
  maskLen = 0n;
  masksP: bigint[] = [];
  masksO: bigint[] = [];
  masksLen: bigint[] = [];
  cols = 0;
  rows = 0;
  comparer = BitComparer.NONE;
  log? = false;

  constructor(init?: Partial<Combo>) {
    Object.assign(this, init);
  }
}

export class Combination {
  combinations: Combo[] = [
    {
      name: "Open Five",
      type: ComboNames.FIVE,
      maskPlayer: 0b11111n,
      maskOld: 0n,
      maskEmpty: 0n,
      maskEnemy: 0n,
      maskBorder: 0b11111n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NONE,
    },
    {
      name: "Open Four",
      type: ComboNames.OPENFOUR,
      maskPlayer: 0b011110n,
      maskOld: 0b100001n,
      maskEmpty: 0b100001n,
      maskEnemy: 0n,
      maskBorder: 0b111111n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.EMPTY,
      log: true,
    },

    //0111111111111111110
    //111111111111111110
    //111111111111111110
    //111111111111111110
    //111111111111111110
    //111111111111111110

    //011110000000000000
    //01111000000000000
    //00000000111100000
    //

    //P  000111100101100100
    //MP 00111100000000000


    //E  01000010000000000 wrong
    //E  01000000000000000 ok
    //E  00000010000000000 ok
    //ME 01000010000000000

    {
      name: "Closed Four 1",
      type: ComboNames.CLOSEDFOUR,
      maskPlayer: 0b011110n,
      maskOld: 0b111110n,
      maskEmpty: 0b100000n,
      maskEnemy: 1n,
      maskBorder: 0b111110n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.FILLED,
    },
    {
      name: "Closed Four 11",
      type: ComboNames.CLOSEDFOUR,
      maskPlayer: 0b011110n,
      maskOld: 0b011111n,
      maskEmpty: 1n,
      maskEnemy: 0b100000n,
      maskBorder: 0b011111n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.FILLED,
    },
    {
      name: "Closed Four 3",
      type: ComboNames.CLOSEDFOUR,
      maskPlayer: 0b11011n,
      maskOld: 0b00100n,
      maskEmpty: 0b100n,
      maskEnemy: 0n,
      maskBorder: 0b11111n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Closed Four 4",
      type: ComboNames.CLOSEDFOUR,
      maskPlayer: 0b11101n,
      maskOld: 0b00010n,
      maskEmpty: 0b10n,
      maskEnemy: 0n,
      maskBorder: 0b11111n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Closed Four 5",
      type: ComboNames.CLOSEDFOUR,
      maskPlayer: 0b10111n,
      maskOld: 0b01000n,
      maskEmpty: 0b1000n,
      maskEnemy: 0n,
      maskBorder: 0b11111n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Open Three 1",
      type: ComboNames.OPENTHREE,
      maskPlayer: 0b01110n,
      maskOld: 0b10001n,
      maskEmpty: 0b10001n,
      maskEnemy: 0b0n,
      maskBorder: 0b11111n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Open Three 21",
      type: ComboNames.OPENTHREE,
      maskPlayer: 0b010110n,
      maskOld: 0b01001n,
      maskEmpty: 0b10001n,
      maskEnemy: 0b100000n,
      maskBorder: 0b011111n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Open Three 22",
      type: ComboNames.OPENTHREE,
      maskPlayer: 0b010110n,
      maskOld: 0b101001n,
      maskEmpty: 0b101000n,
      maskEnemy: 1n,
      maskBorder: 0b111110n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Open Three 31",
      type: ComboNames.OPENTHREE,
      maskPlayer: 0b011010n,
      maskOld: 0b100101n,
      maskEmpty: 0b100100n,
      maskEnemy: 1n,
      maskBorder: 0b111110n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Open Three 32",
      type: ComboNames.OPENTHREE,
      maskPlayer: 0b011010n,
      maskOld: 0b100101n,
      maskEmpty: 0b101n,
      maskEnemy: 0b100000n,
      maskBorder: 0b011111n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.EMPTY,
    },
    {
      name: "Closed Three 1",
      type: ComboNames.CLOSEDTHREE,
      maskPlayer: 0b001110n,
      maskOld: 0b000001n,
      maskEmpty: 0b110000n,
      maskEnemy: 0b000001n,
      maskBorder: 0b111110n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.FILLED,
    },
    {
      name: "Closed Three 2",
      type: ComboNames.CLOSEDTHREE,
      maskPlayer: 0b011100n,
      maskOld: 0b000011n,
      maskEmpty: 0b11n,
      maskEnemy: 0b100000n,
      maskBorder: 0b0011111n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.FILLED,
    },
// {
//     three1: 0b111n,
//     three2: 0b1101n,
//     three3: 0b1011n,
//     three4: 0b10101n,
//     three5: 0b11001n,
//     three6: 0b10011n,
//   };
  ];
  size = 19;

  static rotate(mask: bigint, width: number, height: number, direction: Dir, boardWidth: number): bigint {
    let rotatedMask = 0n;
    let num = 0;
    while (mask) {
      if (mask & 1n) {
        switch (direction) {
          case Dir.S: {
            rotatedMask |= 1n << BigInt(num * (boardWidth + 1));
            break;
          }
          case Dir.SE: {
            rotatedMask |= 1n << BigInt(num * (boardWidth + 1) + num);
            break;
          }
          case Dir.SW: {
            rotatedMask |= 1n << BigInt(num * (boardWidth + 1) + (width - num - 1));
            break;
          }
        }
      }
      mask >>= 1n;
      num++;
    }
    // console.log(BitBoard.printBitBoard(rotatedMask, boardWidth))
    return rotatedMask;
  }

  constructor(size: number) {
    this.size = size;
    this.rotateCombos();
    // this.setMasks();
    // this.setMasksOne()
  }

  private setMasks() {
    this.combinations.forEach(combo => {
      let maskP = combo.maskPlayer << 1n;
      let maskO = combo.maskOld << 1n;
      let maskLen = combo.maskLen << 1n;
      for (let row = 0; row <= (this.size - combo.rows); row++) {
        for (let col = 0; col <= (this.size - combo.cols); col++) {
          combo.masksP.push(maskP);
          combo.masksO.push(maskO);
          combo.masksLen.push(maskLen);
          // console.log(BitBoard.printBitBoard(maskP, this.size))
          maskP <<= 1n;
          maskO <<= 1n;
          maskLen <<= 1n;
        }
        maskP <<= BigInt(combo.cols);
        maskO <<= BigInt(combo.cols);
        maskLen <<= BigInt(combo.cols);
      }
    });
  }

  rotateCombos() {

    this.combinations.forEach(combo => {


      [Dir.SW, Dir.SE, Dir.S].forEach(direction => {
        let row = 0;
        let col = 0;
        switch (direction) {
          case Dir.SW:
            case Dir.SE: {
            row = combo.cols;
            col = combo.cols;
            break;
          }
          case Dir.S: {
            row = combo.cols;
            col = combo.rows;
            break;
          }
        }
        this.combinations.push({
          name: combo.name,
          type: combo.type,
          maskPlayer: Combination.rotate(combo.maskPlayer, combo.cols, combo.rows, direction, this.size),
          maskOld: Combination.rotate(combo.maskOld, combo.cols, combo.rows, direction, this.size),
          //TODO: check rotation of new masks - size may be wronf
          maskEmpty: Combination.rotate(combo.maskEmpty, combo.cols, combo.rows, direction, this.size),
          maskEnemy: Combination.rotate(combo.maskEnemy, combo.cols, combo.rows, direction, this.size),
          maskBorder: Combination.rotate(combo.maskBorder, combo.cols, combo.rows, direction, this.size),
          maskLen: Combination.rotate(combo.maskLen, combo.cols, combo.rows, direction, this.size),
          masksP: [],
          masksO: [],
          masksLen: [],
          cols: col,
          rows: row,
          comparer: combo.comparer,
        });
      });
    });
  }

  private setMasksOne() {
    this.combinations.forEach(combo => {
      combo.masksP.push(combo.maskPlayer);
      combo.masksO.push(combo.maskEnemy);
      combo.masksLen.push(combo.maskLen);
      });
  }
}
