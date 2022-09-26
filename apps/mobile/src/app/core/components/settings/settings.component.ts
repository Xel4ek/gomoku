import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { GameService, PlayerType } from '../../services/game/game.service';
import { Router } from '@angular/router';

class Player {
  constructor(readonly type: PlayerType, readonly title: string) {}
}

@Component({
  selector: 'gomoku-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  settingsForm: UntypedFormGroup;
  playerType = PlayerType;
  players = [
    new Player(PlayerType.AI, 'Ai'),
    new Player(PlayerType.HUMAN, 'Human'),
  ];
  deep = [0, 1, 2, 3];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly gameService: GameService,
    private readonly router: Router
  ) {
    this.settingsForm = formBuilder.group({
      player: [this.players[1]],
      playerDeep: [this.deep[1]],
      enemy: [this.players[0]],
      enemyDeep: [this.deep[1]],
      size: [19],
    });
  }

  startGame() {
    this.gameService.initGame(this.settingsForm);
    this.router.navigate(['/game']);
  }
}
