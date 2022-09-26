import { Injectable } from '@angular/core';
import { IAi } from '../../interfaces/ai';
import { GameBoard } from "../../interfaces/gameBoard";

@Injectable({
  providedIn: 'root',
})
export class MatrixAIService implements IAi {
  constructor() {
    console.log('MATRIX AI!');
  }

  getNextAction(board: GameBoard, callback: (turn: number) => void): void {
    console.log('not implemented!');
  }
}
