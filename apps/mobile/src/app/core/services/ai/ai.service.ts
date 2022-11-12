import { Injectable, NgZone } from '@angular/core';
import { GameService, PlayerType } from '../game/game.service';
import { filter, tap } from 'rxjs/operators';
import { ActionService } from './action.service';
import { StrategyFactoryService } from './strategy-factory.service';
import { IAi } from '../../interfaces/ai';
import { GameBoard } from '../../interfaces/gameBoard';

//TODO: Check score calculation (may be wrong shift to N, NW, NE)
//TODO: place AI to worker
//TODO: remove forbidden moves
//TODO: add scoring of capture moves, or may be not (static eval will be enough)

// @Injectable({
//   providedIn: 'root',
// })
// TODO: move this services to worker
export class AiService implements IAi {
  depth = 3;
  //TODO: add time limit
  timeLimit = 500; //milliseconds
  winCount = 5;

  constructor(
    private readonly gameService: GameService,
    private readonly strategyFactoryService: StrategyFactoryService
  ) {
    // const worker = new Worker();
    const subscriber = gameService
      .sequence$()
      .pipe(
        filter((data) =>
          data.id % 2
            ? data.enemy.type === PlayerType.AI
            : data.player.type === PlayerType.AI
        ),
        tap((data) => {
          const onmessage = async (turn: number) => {
            const turnsMap = data.id % 2 ? data.enemy.map : data.player.map;
            turnsMap.push(turn);
            console.warn('------------------------>', turn);
            this.gameService.makeTurn(data);
          };
          if (!data.player.options.nextTurn) {
            data.player.options.nextTurn = (board, callback) => {
              const strategy = this.strategyFactoryService.get(
                data.player.options.deep
              );
              callback(
                strategy.getNextTurn({
                  ...board,
                  player: board.enemy,
                  enemy: board.player,
                })
              );
            };
          }
          if (!data.enemy.options.nextTurn) {
            data.enemy.options.nextTurn = (board, callback) => {
              const strategy = this.strategyFactoryService.get(
                data.enemy.options.deep
              );
              callback(strategy.getNextTurn(board));
            };
          }
          if (data.id % 2) {
            data.player.options.nextTurn(data, onmessage);
          } else {
            data.enemy.options.nextTurn(data, onmessage);
          }
          // if (!(data.id % 2)) {
          //   this.getNextAction(
          //     { ...data, enemy: { ...data.player }, player: { ...data.enemy } },
          //     onmessage
          //   );
          // } else {
          //   this.getNextAction({ ...data }, onmessage);
          // }
        })
      )
      .subscribe();
    // TODO: Subscribe to messages
  }

  // mockAction(dummy: string, callback: (turn: number) => void) {
  //   callback(Math.trunc(Math.random() * 19 * 19));
  // }

  getNextAction(board: GameBoard, callback: (turn: number) => void): void {
    callback(this.strategyFactoryService.get(3).getNextTurn(board));
  }
}
