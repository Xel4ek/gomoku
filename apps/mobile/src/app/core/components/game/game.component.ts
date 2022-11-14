import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameService } from '../../services/game/game.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkerReport } from '../../ai/negamax-generic-strategy';
interface PlayerInfo {
  name: string;
  color: string;
  turn: boolean;
  captured: number;
  info: WorkerReport[];
  depth?: number;
}
@Component({
  selector: 'gomoku-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  player?: string;
  enemy?: string;
  players$: Observable<{
    player: PlayerInfo;
    enemy: PlayerInfo;
    advance: {
      winner?: string;
      color: string;
      turn: number;
    };
  }>;

  constructor(private readonly gameService: GameService) {
    this.players$ = this.gameService.sequence$().pipe(
      map((data) => {
        return {
          player: {
            name: data.player.type,
            color: data.player.color + '1)',
            captured: data.player.captured,
            turn: !!(data.id % 2),
            info: data.player.info.sequence,
            depth: data.player.options.deep,
          },

          enemy: {
            name: data.enemy.type,
            color: data.enemy.color + '1)',
            captured: data.enemy.captured,
            turn: !!(data.id % 2),
            info: data.enemy.info.sequence,
            depth: data.enemy.options.deep,
          },
          advance: {
            winner: data.winner ? data.winner.color() : undefined,
            color:
              (!((data.id - +!!data.winner) % 2)
                ? data.player.color
                : data.enemy.color) + '1)',
            turn: Math.trunc(data.id / 2) + 1 - +!!data.winner,
          },
        };
      })
    );
  }
}
