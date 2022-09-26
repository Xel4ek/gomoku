import { Injectable, NgZone } from '@angular/core';
import { IAi } from '../../interfaces/ai';
import { GameService, PlayerType } from '../game/game.service';
import { ActionService } from '../ai/action.service';
import { StrategyFactoryService } from '../ai/strategy-factory.service';
import { filter, tap } from 'rxjs/operators';
import { GameBoard } from "../../interfaces/gameBoard";

@Injectable({
  providedIn: 'root',
})
export class SimpleAiService implements IAi {
  depth = 3;
  //TODO: add time limit
  timeLimit = 500; //milliseconds
  winCount = 5;

  constructor(
    private readonly gameService: GameService,
    private readonly actionService: ActionService,
    private readonly strategyFactoryService: StrategyFactoryService,
    private readonly ngZone: NgZone
  ) {
    const worker = new Worker('');
    const subscriber = gameService
      .sequence$()
      .pipe(
        filter((data) =>
          data.id % 2
            ? data.enemy.type === PlayerType.AI
            : data.player.type === PlayerType.AI
        ),
        tap((data) => {
          //console.debug('From sequence ', data);
          const onmessage = (turn: number) => {
            //console.debug('AI moved ', turn);
            const turnsMap = data.id % 2 ? data.enemy.map : data.player.map;
            turnsMap.push(turn);
            this.gameService.makeTurn(data);
            // worker.onmessage = tu;
          };
          this.getNextAction({ ...data }, onmessage);
          // this.getNextAction(this.boardService.createFromGameBoard({ ...data }), onmessage);
          // this.mockAction('', onmessage);
        })
      )
      .subscribe();
    // TODO: Subscribe to messages
  }

  // mockAction(dummy: string, callback: (turn: number) => void) {
  //   callback(Math.trunc(Math.random() * 19 * 19));
  // }

  getNextAction(board: GameBoard, callback: (turn: number) => void): void {
    this.ngZone.runOutsideAngular(() => {
      callback(this.strategyFactoryService.get('').getNextTurn(board));
    });
  }
}
