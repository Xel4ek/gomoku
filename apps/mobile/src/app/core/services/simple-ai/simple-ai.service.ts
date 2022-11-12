import { NgZone } from '@angular/core';
import { IAi } from '../../interfaces/ai';
import { GameService, PlayerType } from '../game/game.service';
import { StrategyFactoryService } from '../ai/strategy-factory.service';
import { filter, map, takeUntil, takeWhile } from 'rxjs/operators';
import { GameBoard } from '../../interfaces/gameBoard';
import { Subject } from 'rxjs';

export class SimpleAiService implements IAi {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly gameService: GameService,
    // private readonly actionService: ActionService,
    private readonly strategyFactoryService: StrategyFactoryService,
    private readonly ngZone: NgZone
  ) {
    // const worker = new Worker('');
    gameService
      .sequence$()
      .pipe(
        takeUntil(this.destroy$),
        takeWhile((data) => !data.winner),
        filter((data) =>
          data.id % 2
            ? data.enemy.type === PlayerType.AI
            : data.player.type === PlayerType.AI
        ),
        map((data) => {
          if (
            !data.player.options.nextTurn &&
            data.player.type === PlayerType.AI
          ) {
            data.player.options.nextTurn = async (board, callback) => {
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
          if (
            !data.enemy.options.nextTurn &&
            data.enemy.type === PlayerType.AI
          ) {
            data.enemy.options.nextTurn = async (board, callback) => {
              const strategy = this.strategyFactoryService.get(
                data.enemy.options.deep
              );
              callback(strategy.getNextTurn(board));
            };
          }
          return data;
        }),
        map((data) => {
          const onmessage = async (turn: number) => {
            setTimeout(() => {
              const turnsMap = data.id % 2 ? data.enemy.map : data.player.map;
              turnsMap.push(turn);
              this.gameService.makeTurn(data);
            }, 0);
          };
          if (data.id % 2 && data.enemy.type === PlayerType.AI) {
            this.ngZone.runOutsideAngular(() => {
              data.enemy.options.nextTurn?.(data, onmessage);
            });
          }
          if (!(data.id % 2) && data.player.type === PlayerType.AI) {
            this.ngZone.runOutsideAngular(() => {
              data.player.options.nextTurn?.(data, onmessage);
            });
          }
        })
      )
      .subscribe();
    // TODO: Subscribe to messages
  }

  getNextAction(board: GameBoard, callback: (turn: number) => void): void {
    this.ngZone.runOutsideAngular(() => {
      callback(this.strategyFactoryService.get(3).getNextTurn(board));
    });
  }

  destroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
