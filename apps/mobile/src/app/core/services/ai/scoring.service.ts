import { Injectable } from '@angular/core';
import { BoardBits } from "../board/boardBits";

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  constructor() { }

  checkWin(board: BoardBits) {
    return false;
  }

  calculate(board: BoardBits): number {
    return 0;
  }
}
