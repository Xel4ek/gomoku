export enum Dir {
  E,
  S,
  SE,
  SW
}

export enum ComboNames {
  FIVE,
  OPENFOUR,
  CLOSEDFOUR,
  OPENTHREE,
  CLOSEDTHREE,
}

export interface Combo {
  name: string,
  type: ComboNames,
  maskP: bigint,
  maskO: bigint,
  masksP: bigint[],
  masksO: bigint[],
  cols: number,
  rows: number,
}

export class Combination {
  combinations: Combo[] = [
    {
      name: "Open Five",
      type: ComboNames.FIVE,
      maskP: BigInt("0b11111"),
      maskO: BigInt("0"),
      masksP: [],
      masksO: [],
      cols: 5,
      rows: 1,
    },
    {
      name: "Open Four",
      type: ComboNames.OPENFOUR,
      maskP: BigInt("0b11110"),
      maskO: BigInt("0b100001"),
      masksP: [],
      masksO: [], cols: 6,
      rows: 1,
    },
    {
      name: "Closed Four 1",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b1111"),
      maskO: BigInt("0b011110"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
    {
      name: "Closed Four 2",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b11011"),
      maskO: BigInt("0b100"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Closed Four 3",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b11101"),
      maskO: BigInt("0b10"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Closed Four 4",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b10111"),
      maskO: BigInt("0b1000"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Open Three 1",
      type: ComboNames.OPENTHREE,
      maskP: BigInt("0b1110"),
      maskO: BigInt("0b10001"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Open Three 2",
      type: ComboNames.OPENTHREE,
      maskP: BigInt("0b1011"),
      maskO: BigInt("0b100"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
    {
      name: "Open Three 3",
      type: ComboNames.OPENTHREE,
      maskP: BigInt("0b1101"),
      maskO: BigInt("0b10"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
    {
      name: "Closed Three 1",
      type: ComboNames.CLOSEDTHREE,
      maskP: BigInt("0b1110"),
      maskO: BigInt("0b1"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
// {
//     three1: BigInt("0b111"),
//     three2: BigInt("0b1101"),
//     three3: BigInt("0b1011"),
//     three4: BigInt("0b10101"),
//     three5: BigInt("0b11001"),
//     three6: BigInt("0b10011"),
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
    this.setMasks();
    this.rotateCombos();
  }

  private setMasks() {
    this.combinations.forEach(combo => {
      let maskP = combo.maskP;
      let maskO = combo.maskO;
      for (let row = 0; row < (this.size - combo.rows); row++) {
        for (let col = 0; col <= (this.size - combo.cols); col++) {
          combo.masksP.push(maskP);
          combo.masksO.push(maskO);
          maskP <<= 1n;
          maskO <<= 1n;
        }
        maskP <<= BigInt(combo.cols + 1);
        maskO <<= BigInt(combo.cols + 1);
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
          masksP: [],
          masksO: [],
          cols: combo.cols,
          rows: combo.cols,
        });
      });
    });
  }

}
