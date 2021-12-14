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
}

export enum BitComparer {
  NONE,
  AND,
  OR,
  XOR,
  NOT,
  ANY,
}

export class Combo {
  name = "default";
  type = ComboNames.DUMMY;
  maskP = 0n;
  maskO = 0n;
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
      maskP: 0b11111n,
      maskO: 0b0n,
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
      maskP: 0b011110n,
      maskO: 0b100001n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.NOT,
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
      maskP: 0b011110n,
      maskO: 0b100001n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.OR,
    },
    {
      name: "Closed Four 2",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b11110n,
      maskO: 0b00001n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Closed Four 3",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b11011n,
      maskO: 0b00100n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Closed Four 4",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b11101n,
      maskO: 0b00010n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Closed Four 5",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b10111n,
      maskO: 0b01000n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Open Three 1",
      type: ComboNames.OPENTHREE,
      maskP: 0b01110n,
      maskO: 0b10001n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Open Three 21",
      type: ComboNames.OPENTHREE,
      maskP: 0b10110n,
      maskO: 0b01001n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Open Three 22",
      type: ComboNames.OPENTHREE,
      maskP: 0b01011n,
      maskO: 0b10100n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Open Three 31",
      type: ComboNames.OPENTHREE,
      maskP: 0b11010n,
      maskO: 0b00101n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Open Three 32",
      type: ComboNames.OPENTHREE,
      maskP: 0b01101n,
      maskO: 0b10010n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Closed Three 1",
      type: ComboNames.CLOSEDTHREE,
      maskP: 0b01110n,
      maskO: 0b10001n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.OR,
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
    this.setMasks();
  }

  private setMasks() {
    this.combinations.forEach(combo => {
      let maskP = combo.maskP << 1n;
      let maskO = combo.maskO << 1n;
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
          maskP: Combination.rotate(combo.maskP, combo.cols, combo.rows, direction, this.size),
          maskO: Combination.rotate(combo.maskO, combo.cols, combo.rows, direction, this.size),
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

}
