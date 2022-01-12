import { ComboNames } from "./combination";

export class Pattern {
  name: string;
  type: ComboNames;
  player = 0n;
  enemy = 0n;
  empty = 0n;
  length = 0;

  constructor(name: string, type: ComboNames, player: bigint, enemy: bigint, empty: bigint) {
    this.name = name;
    this.type = type;
    this.player = player;
    this.enemy = enemy;
    this.empty = empty;
    let len = player | enemy | empty;
    while (len) {
      this.length += 1;
      len >>= 1n;
    }
  }

}
