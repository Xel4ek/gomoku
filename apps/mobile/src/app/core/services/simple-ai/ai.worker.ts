import { NegamaxGenericStrategy } from '../../ai/negamax-generic-strategy';
import { IBoard } from '../../interfaces/IBoard';
import { PlayerType } from '../../interfaces/player';
addEventListener('message', ({ data }) => {
  const start = performance.now();
  let turn = {};
  if (data.id % 2 && data.enemy.type === PlayerType.AI) {
    turn = NegamaxGenericStrategy.getStrategy<IBoard>(
      data.enemy.options.deep
    ).getNextTurn(data);
  }
  if (!(data.id % 2) && data.player.type === PlayerType.AI) {
    turn = NegamaxGenericStrategy.getStrategy<IBoard>(
      data.player.options.deep
    ).getNextTurn({
      ...data,
      player: data.enemy,
      enemy: data.player,
    });
  }

  self.postMessage({ ...turn, delta: performance.now() - start });
});
