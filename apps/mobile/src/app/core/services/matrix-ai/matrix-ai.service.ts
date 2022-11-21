import { Injectable } from '@angular/core';
import { IAi } from '../../interfaces/ai';
import { GameBoard } from "../../interfaces/gameBoard";

@Injectable({
  providedIn: 'root',
})
export class MatrixAIService implements IAi {
  constructor() {
    
  }

  getNextAction(board: GameBoard, callback: (turn: number) => void): void {
    
  }
}
