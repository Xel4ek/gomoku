import { Component } from '@angular/core';
import { GameService, PlayerType } from '../../services/game/game.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'gomoku-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent {
  player?: string;
  enemy?: string;
  players$: Observable<
    [
      { name: string; color: string; turn: boolean },
      { name: string; color: string },
      string | undefined
    ]
  >;

  constructor(private readonly gameService: GameService) {
    this.players$ = this.gameService.sequence$().pipe(
      map((data) => {
        return [
          {
            name: PlayerType[data.player.type],
            color: data.player.options.color(),
            turn: Boolean(data.id % 2),
          },
          {
            name: PlayerType[data.enemy.type],
            color: data.enemy.options.color(),
          },
          data.winner ? data.winner.color() : undefined,
        ];
      })
    );
  }
}
