import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameService } from '../../services/game/game.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'gomoku-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  player?: string;
  enemy?: string;
  players$: Observable<
    [
      {
        name: string;
        color: string;
        turn: boolean;
        captured: number;
        info: { turn: number; delta: number; nodeShow: number }[];
        depth?: number;
      },
      {
        name: string;
        color: string;
        captured: number;
        info: { turn: number; delta: number; nodeShow: number }[];
        depth?: number;
      },
      string | undefined,
      number
    ]
  >;

  constructor(private readonly gameService: GameService) {
    this.players$ = this.gameService.sequence$().pipe(
      map((data) => {
        return [
          {
            name: data.player.type,
            color: data.player.color + '1)',
            captured: data.player.captured,
            turn: !!(data.id % 2),
            info: data.player.info.sequence,
            depth: data.player.options.deep,
          },
          {
            name: data.enemy.type,
            color: data.enemy.color + '1)',
            captured: data.enemy.captured,
            info: data.enemy.info.sequence,
            depth: data.enemy.options.deep,
          },

          data.winner ? data.winner.color() : undefined,
          data.id,
        ];
      })
    );
  }
}
