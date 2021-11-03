import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from "rxjs";
import { AI, AiService, GameBoard } from "../ai/ai.service";
import { BitBoard } from "../bit-board";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  subject = new Subject<GameBoard>();

  constructor(private aiService: AiService) {
    this.subject.subscribe(gameBoard => this.onEvent(gameBoard));
  }

  onEvent(gameBoard: GameBoard) {
    if (gameBoard.isPlayer) {
      gameBoard.lastMove = this.aiService.getNextAction(new BitBoard(19, gameBoard));
      // gameBoard.lastMove = Math.floor(Math.random() * gameBoard.size * gameBoard.size).toString();
      gameBoard.isPlayer = !gameBoard.isPlayer;
      this.subject.next(gameBoard);
    }
    console.log(gameBoard);
  }
}
