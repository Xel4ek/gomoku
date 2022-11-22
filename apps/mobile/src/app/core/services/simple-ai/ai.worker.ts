import { NegamaxGenericStrategy } from '../../ai/negamax-generic-strategy';
import { PlayerType } from '../../interfaces/player';
addEventListener('message', ({ data }) => {
  const start = performance.now();
  let turn = {};
  if (data.id % 2 && data.enemy.type === PlayerType.AI) {
    turn = NegamaxGenericStrategy.getStrategy(
      data.enemy.options.deep
    ).getNextTurn(data);
  }
  if (!(data.id % 2) && data.player.type === PlayerType.AI) {
    turn = NegamaxGenericStrategy.getStrategy(
      data.player.options.deep
    ).getNextTurn({
      ...data,
      player: data.enemy,
      enemy: data.player,
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  postMessage({ ...turn, delta: performance.now() - start });
});
