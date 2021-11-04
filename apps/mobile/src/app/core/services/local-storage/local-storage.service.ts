import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { AiService, GameBoard } from "../ai/ai.service";
import { BitBoard } from "../board/bit-board";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  subject = new Subject<GameBoard>();
  boards: BitBoard[] = [];

  constructor(private aiService: AiService) {
    this.subject.subscribe(gameBoard => this.onEvent(gameBoard));
  }

  saveBoard(board: BitBoard) {
    return this.boards.push(board);
  }

  loadBoard(id?: number) {
    if (!id) {
      return
    }
  }

  onMessage() {
    this.subject.asObservable();
  }

  addMessage(gameBoard: GameBoard) {
    this.subject.next(gameBoard);
  }

  onEvent(gameBoard: GameBoard) {
    console.log(gameBoard);
    if (gameBoard.isPlayer) {
      const move = this.aiService.getNextAction(new BitBoard(19, gameBoard));
      gameBoard.lastMove = move;
      gameBoard.opp.push(move);
      // gameBoard.lastMove = Math.floor(Math.random() * gameBoard.size * gameBoard.size).toString();
      gameBoard.isPlayer = !gameBoard.isPlayer;
      gameBoard.id += 1;
      this.subject.next(gameBoard);
    }
    console.log(gameBoard);
  }
}
