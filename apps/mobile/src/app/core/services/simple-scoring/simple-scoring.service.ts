import { Injectable } from '@angular/core';
import { Scoring } from '../../interfaces/scoring';
import { BoardBits } from '../board/boardBits';
import { Color } from '../../color';
import { PatternService } from '../board/pattern.service';

@Injectable({
  providedIn: 'root',
})
export class SimpleScoringService implements Scoring {
  private winScore = 1000000;

  constructor(private readonly patternService: PatternService) {}

  getConsecutiveSetScore(count: number, blocks: number, currentTurn: boolean) {
    const winGuarantee = 1000000;
    // If both sides of a set is blocked, this set is worthless return 0 points.
    if (blocks == 2 && count < 5) return 0;

    switch (count) {
      case 5: {
        // 5 consecutive wins the game
        return this.winScore;
      }
      case 4: {
        // 4 consecutive stones in the user's turn guarantees a win.
        // (User can win the game by placing the 5th stone after the set)
        if (currentTurn) return winGuarantee;
        else {
          // Opponent's turn
          // If neither side is blocked, 4 consecutive stones guarantees a win in the next turn.
          if (blocks == 0) return winGuarantee / 4;
          // If only a single side is blocked, 4 consecutive stones limits the opponents move
          // (Opponent can only place a stone that will block the remaining side, otherwise the game is lost
          // in the next turn). So a relatively high score is given for this set.
          else return 200;
        }
      }
      case 3: {
        // 3 consecutive stones
        if (blocks == 0) {
          // Neither side is blocked.
          // If it's the current player's turn, a win is guaranteed in the next 2 turns.
          // (User places another stone to make the set 4 consecutive, opponent can only block one side)
          // However the opponent may win the game in the next turn therefore this score is lower than win
          // guaranteed scores but still a very high score.
          if (currentTurn) return 50000;
          // If it's the opponent's turn, this set forces opponent to block one of the sides of the set.
          // So a relatively high score is given for this set.
          else return 200;
        } else {
          // One of the sides is blocked.
          // Playmaker scores
          if (currentTurn) return 10;
          else return 5;
        }
      }
      case 2: {
        // 2 consecutive stones
        // Playmaker scores
        if (blocks == 0) {
          if (currentTurn) return 7;
          else return 5;
        } else {
          return 3;
        }
      }
      case 1: {
        return 1;
      }
    }

    // More than 5 consecutive stones?
    return this.winScore * 2;
  }
  evaluate(board: BoardBits, side: Color, turn: Color) {
    let consecutive = 0;
    let blocks = 2;
    let score = 0;

    const tempBoard = board.clone();

    // Iterate over all cells
    while (tempBoard.border > 0n) {
      // Check only non-border cells
      if ((tempBoard.border & 1n) != 1n) {
        // Check if the selected player has a stone in the current cell
        if ((tempBoard[side] & 1n) === 1n) {
          consecutive++;
        }
        // Check if cell is empty
        else if (((tempBoard.red & tempBoard.blue) & 1n) === 0n) {
          // Check if there were any consecutive stones before this empty cell
          if (consecutive > 0) {
            // Consecutive set is not blocked by opponent, decrement block count
            blocks--;
            // Get consecutive set score
            score += this.getConsecutiveSetScore(consecutive, blocks, turn == side);
            // Reset consecutive stone count
            consecutive = 0;
            // Current cell is empty, next consecutive set will have at most 1 blocked side.
            blocks = 1;
          } else {
            // No consecutive stones.
            // Current cell is empty, next consecutive set will have at most 1 blocked side.
            blocks = 1;
          }
        } else if (consecutive > 0) {
          // Get consecutive set score
          score += this.getConsecutiveSetScore(consecutive, blocks, turn == side);
          // Reset consecutive stone count
          consecutive = 0;
          // Current cell is occupied by opponent, next consecutive set may have 2 blocked sides
          blocks = 2;
        } else {
          // Current cell is occupied by opponent, next consecutive set may have 2 blocked sides
          blocks = 2;
        }
      }
      // End of row, check if there were any consecutive stones before we reached right border
      else {
        if (consecutive > 0) {
          score += this.getConsecutiveSetScore(consecutive, blocks, turn == side);
          console.log(score);
        }
        consecutive = 0;
        blocks = 2;
      }
      // Reset consecutive stone and blocks count at the end of row
      tempBoard.border >>= 1n;
      tempBoard.red >>= 1n;
      tempBoard.blue >>= 1n;
    }
    return score;
  }

  /**
   * This function returns the score of a given consecutive stone set.
   * @count: Number of consecutive stones in the set
   * @blocks: Number of blocked sides of the set (2: both sides blocked, 1: single side blocked, 0: both sides free)
   */
  getScore(board: BoardBits, side: Color, turn: Color) {
    const boards = this.patternService.rotateBoard(board);
    return (
      this.evaluate(boards[0], side, turn) +
      this.evaluate(boards[1], side, turn) +
      this.evaluate(boards[2], side, turn) +
      this.evaluate(boards[3], side, turn)
    );
  }

  // This function calculates the relative score of the white player against the black.
  // (i.e. how likely is white player to win the game before the black player)
  // This value will be used as the score in the Minimax algorithm.
  evaluateBoard(board: BoardBits, turn: Color): number {

    // Get board score of both players.
    board.scoreRed = this.getScore(board, 'red', turn);
    board.scoreBlue = this.getScore(board, 'blue', turn);

    if (board.scoreRed === 0) {
      board.scoreRed = 1.0;
    }
    // Calculate relative score of white against black
    return board.scoreRed / board.scoreBlue;
  }
}
