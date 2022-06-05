import { ComboNames } from "./combination";

export type TemplatePattern = Pick<Pattern, "name" | "type" | "player" | "empty" | "enemy">

export class Pattern {
  name: string;
  type: ComboNames;
  player = 0n;
  enemy = 0n;
  empty = 0n;
  length = 0;

  constructor({name, type, player, enemy, empty}: TemplatePattern) {
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
