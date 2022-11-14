import { GameService } from '../game/game.service';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GameBoard } from '../../interfaces/gameBoard';
import { PlayerType } from '../../interfaces/player';
import { WorkerReport } from '../../ai/negamax-generic-strategy';

export class SimpleAiService {
  private worker: Worker;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly gameService: GameService // private readonly actionService: ActionService, // private readonly ngZone: NgZone
  ) {
    this.worker = new Worker(new URL('./ai.worker', import.meta.url));

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
          this.worker.onmessage = ({
            data: { turn, delta, count, capacity },
          }: {
            data: WorkerReport;
          }) => {
            const current = data.id % 2 ? data.enemy : data.player;
            const turnsMap = current.map;
            turnsMap.push(turn);
            if (!data.winner) {
              current.info.sequence.push({
                turn: data.id + 1,
                delta,
                count,
                capacity,
              });
              this.gameService.makeTurn(data);
            }
          };
        }),
        map((data) => this.worker.postMessage(data))
      )
      .subscribe();
  }

  destroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.worker.terminate();
  }
}
