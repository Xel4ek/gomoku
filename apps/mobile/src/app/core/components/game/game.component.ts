import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { GameService, PlayerType } from '../../services/game/game.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'gomoku-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnDestroy {
  player?: string;
  enemy?: string;
  players$: Observable<
    [
      { name: string; color: string; turn: boolean; captured: number },
      { name: string; color: string; captured: number },
      string | undefined,
      number
    ]
  >;

  constructor(private readonly gameService: GameService) {
    console.warn('CREATED');
    this.players$ = this.gameService.sequence$().pipe(
      map((data) => {
        return [
          {
            name: PlayerType[data.player.type],
            color: data.player.options.color(),
            captured: data.player.captured,
            turn: !!(data.id % 2),
          },
          {
            name: PlayerType[data.enemy.type],
            color: data.enemy.options.color(),
            captured: data.enemy.captured,
          },
          data.winner ? data.winner.color() : undefined,
          data.id,
        ];
      })
    );
  }

  ngOnDestroy(): void {}
}
