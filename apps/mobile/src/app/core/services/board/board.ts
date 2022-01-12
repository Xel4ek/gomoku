export class Board {
  size: number
  player = 0n;
  enemy = 0n;
  border = 0n;

  constructor(size: number, player: bigint, enemy: bigint, border: bigint) {
    this.size = size;
    this.player = player;
    this.enemy = enemy;
    this.border = border;
  }
}
