import { GameService } from '../game/game.service';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GameBoard } from '../../interfaces/gameBoard';
import { PlayerType } from '../../interfaces/player';

export class SimpleAiService {
  private worker: Worker;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly gameService: GameService // private readonly actionService: ActionService, // private readonly ngZone: NgZone
  ) {
    this.worker = new Worker(new URL('./ai.worker', import.meta.url));

    // const worker = new Worker('');
    gameService
      .sequence$()
      .pipe(
        takeUntil(this.destroy$),

        filter((data: GameBoard) => !data.winner),
        filter((data: GameBoard) =>
          data.id % 2
            ? data.enemy.type === PlayerType.AI
            : data.player.type === PlayerType.AI
        ),
        tap((data: GameBoard) => {
          this.worker.onmessage = ({ data: turn }: { data: number }) => {
            const turnsMap = data.id % 2 ? data.enemy.map : data.player.map;
            turnsMap.push(turn);
            this.gameService.makeTurn(data);
          };
        }),
        map((data) => this.worker.postMessage(data))
        // map((data) => {
        //   if (
        //     !data.player.options.nextTurn &&
        //     data.player.type === PlayerType.AI
        //   ) {
        //     data.player.options.nextTurn = async (board, callback) => {
        //       const strategy = NegamaxGenericStrategy.getStrategy<IBoard>(
        //         data.player.options.deep
        //       );
        //       callback(
        //         strategy.getNextTurn({
        //           ...board,
        //           player: board.enemy,
        //           enemy: board.player,
        //         })
        //       );
        //     };
        //   }
        //   if (
        //     !data.enemy.options.nextTurn &&
        //     data.enemy.type === PlayerType.AI
        //   ) {
        //     data.enemy.options.nextTurn = async (board, callback) => {
        //       const strategy = NegamaxGenericStrategy.getStrategy<IBoard>(
        //         data.enemy.options.deep
        //       );
        //       callback(strategy.getNextTurn(board));
        //     };
        //   }
        //   return data;
        // }),
        // map((data) => {
        //   // const onmessage = async (turn: number) => {
        //   //   setTimeout(() => {
        //   //     const turnsMap = data.id % 2 ? data.enemy.map : data.player.map;
        //   //     turnsMap.push(turn);
        //   //     this.gameService.makeTurn(data);
        //   //   }, 0);
        //   // };
        //   // if (data.id % 2 && data.enemy.type === PlayerType.AI) {
        //   //   this.ngZone.runOutsideAngular(() => {
        //   //     data.enemy.options.nextTurn?.(data, onmessage);
        //   //   });
        //   // }
        //   // if (!(data.id % 2) && data.player.type === PlayerType.AI) {
        //   //   this.ngZone.runOutsideAngular(() => {
        //   //     data.player.options.nextTurn?.(data, onmessage);
        //   //   });
        //   // }
        // })
      )
      .subscribe();
  }

  destroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
