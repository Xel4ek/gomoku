import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GameService } from '../../services/game/game.service';
import { Router } from '@angular/router';
import { PlayerType } from '../../interfaces/player';

class Player {
  constructor(readonly type: PlayerType, readonly title: string) {}
}

@Component({
  selector: 'gomoku-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  settingsForm: FormGroup;
  playerType = PlayerType;
  players = [
    new Player(PlayerType.AI, 'Ai'),
    new Player(PlayerType.HUMAN, 'Human'),
  ];
  deep = [1, 3, 5, 7, 9, 11];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly gameService: GameService,
    private readonly router: Router
  ) {
    this.settingsForm = formBuilder.group({
      player: [this.players[0]],
      playerDeep: [this.deep[0]],
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
