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
  comparer? = BitComparer.NONE;

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
      maskO: 0n,
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
      maskP: 0b11110n,
      maskO: 0b100001n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Closed Four 1",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b1111n,
      maskO: 0b100001n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.ANY,
    },
    {
      name: "Closed Four 2",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b11011n,
      maskO: 0b100n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.ANY,
    },
    {
      name: "Closed Four 3",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b11101n,
      maskO: 0b10n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.AND,
    },
    {
      name: "Closed Four 4",
      type: ComboNames.CLOSEDFOUR,
      maskP: 0b10111n,
      maskO: 0b1000n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.AND,
    },
    {
      name: "Open Three 1",
      type: ComboNames.OPENTHREE,
      maskP: 0b1110n,
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
      name: "Open Three 2",
      type: ComboNames.OPENTHREE,
      maskP: 0b1011n,
      maskO: 0b100n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Open Three 3",
      type: ComboNames.OPENTHREE,
      maskP: 0b1101n,
      maskO: 0b10n,
      maskLen: 0b111111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 6,
      rows: 1,
      comparer: BitComparer.NOT,
    },
    {
      name: "Closed Three 1",
      type: ComboNames.CLOSEDTHREE,
      maskP: 0b111n,
      maskO: 0b10001n,
      maskLen: 0b11111n,
      masksP: [],
      masksO: [],
      masksLen: [],
      cols: 5,
      rows: 1,
      comparer: BitComparer.ANY,
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
    for (let i = width; i > 0; i--) {
      const bitMask = 1 << (i - 1);
      const bitP = mask & BigInt(bitMask);
      if (bitP) {
        const shift =
          direction === Dir.SW ? BigInt(boardWidth * (width - i))
            : direction === Dir.SE ? BigInt(boardWidth * (i - 1))
              : BigInt((boardWidth - 1) * (i - 1));
        rotatedMask |= (bitP << shift);
      }
    }
    return rotatedMask;
  }

  constructor(size: number) {
    this.size = size;
    this.rotateCombos();
    this.setMasks();
  }

  private setMasks() {
    this.combinations.forEach(combo => {
      let maskP = combo.maskP;
      let maskO = combo.maskO;
      let maskLen = combo.maskLen;
      for (let row = 0; row < (this.size - combo.rows); row++) {
        for (let col = 0; col <= (this.size - combo.cols); col++) {
          combo.masksP.push(maskP);
          combo.masksO.push(maskO);
          combo.masksLen.push(maskLen);
          maskP <<= 1n;
          maskO <<= 1n;
          maskLen <<= 1n;
        }
        maskP <<= BigInt(combo.cols + 1);
        maskO <<= BigInt(combo.cols + 1);
        maskLen <<= BigInt(combo.cols + 1);
      }
    });
  }

  rotateCombos() {
    this.combinations.forEach(combo => {
      [Dir.SW, Dir.SE, Dir.S].forEach(direction => {
        this.combinations.push({
          name: combo.name,
          type: combo.type,
          maskP: Combination.rotate(combo.maskP, combo.cols, combo.rows, direction, this.size),
          maskO: Combination.rotate(combo.maskO, combo.cols, combo.rows, direction, this.size),
          maskLen: Combination.rotate(combo.maskLen, combo.cols, combo.rows, direction, this.size),
          masksP: [],
          masksO: [],
          masksLen: [],
          cols: combo.cols,
          rows: combo.cols,
        });
      });
    });
  }

}
