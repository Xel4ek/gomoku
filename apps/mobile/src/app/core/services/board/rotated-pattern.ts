import { Pattern } from "./pattern";
import { ComboNames } from "./combination";

export class RotatedPattern extends Pattern {
  size: number;

  constructor(size: number, name: string, type: ComboNames, player: bigint, enemy: bigint, empty: bigint) {
    super(name, type, player, enemy, empty);
    this.size = size
  }
}
