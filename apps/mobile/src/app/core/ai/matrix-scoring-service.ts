import { BoardMatrix } from '../services/board/board-matrix';
import { EColor } from '../color';
import { IBoard } from '../interfaces/IBoard';

export class MatrixScoring {
  evaluationCount = 0;
  private winScore = 1000000;

  evaluateBoardForRed(board: BoardMatrix, bluesTurn: boolean): void {
    this.evaluationCount++;

    // Get board score of both players.
    board.scoreBlue = this.getScore(board, true, bluesTurn);
    board.scoreRed = this.getScore(board, false, bluesTurn);

    if (board.scoreBlue == 0) {
      board.scoreBlue = 1.0;
    }

    // if (bluesTurn) {
    //   return board.scoreBlue / board.scoreRed;
    // }
    board.score = board.scoreRed - board.scoreBlue;
  }

  // This function calculates the board score of the specified player.
  // (i.e. How good a player's general standing on the board by considering how many
  //  consecutive 2's, 3's, 4's it has, how many of them are blocked etc...)
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

  /**
   * This function returns the score of a given consecutive stone set.
   * @count: Number of consecutive stones in the set
   * @blocks: Number of blocked sides of the set (2: both sides blocked, 1: single side blocked, 0: both sides free)
   */
  getScore(
    boardMatrix: BoardMatrix,
    forBlue: boolean,
    bluesTurn: boolean
  ): number {
    // Calculate score for each of the 3 directions
    return (
      this.evaluateHorizontal(boardMatrix, forBlue, bluesTurn) +
      this.evaluateVertical(boardMatrix, forBlue, bluesTurn) +
      this.evaluateDiagonal(boardMatrix, forBlue, bluesTurn)
    );
  }

  evaluateHorizontal(
    boardMatrix: BoardMatrix,
    forBlues: boolean,
    playersTurn: boolean
  ): number {
    let consecutive = 0;
    // blocks variable is used to check if a consecutive stone set is blocked by the opponent or
    // the board border. If the both sides of a consecutive set is blocked, blocks variable will be 2
    // If only a single side is blocked, blocks variable will be 1, and if both sides of the consecutive
    // set is free, blocks count will be 0.
    // By default, first cell in a row is blocked by the left border of the board.
    // If the first cell is empty, block count will be decremented by 1.
    // If there is another empty cell after a consecutive stones set, block count will again be
    // decremented by 1.
    let blocks = 2;
    let score = 0;

    // Iterate over all rows
    for (let i = 0; i < boardMatrix.board.length; i++) {
      // Iterate over all cells in a row
      for (let j = 0; j < boardMatrix.board[0].length; j++) {
        // Check if the selected player has a stone in the current cell
        const __ret = this.extracted(
          boardMatrix,
          i,
          j,
          forBlues,
          consecutive,
          blocks,
          score,
          playersTurn
        );
        consecutive = __ret.consecutive;
        blocks = __ret.blocks;
        score = __ret.score;
      }
      // End of row, check if there were any consecutive stones before we reached right border
      if (consecutive > 0) {
        score += this.getConsecutiveSetScore(
          consecutive,
          blocks,
          forBlues == playersTurn
        );
      }
      // Reset consecutive stone and blocks count
      consecutive = 0;
      blocks = 2;
    }

    return score;
  }

  private extracted(
    boardMatrix: BoardMatrix,
    i: number,
    j: number,
    forBlues: boolean,
    consecutive: number,
    blocks: number,
    score: number,
    playersTurn: boolean
  ) {
    if (boardMatrix.board[i][j] == (forBlues ? EColor.BLUE : EColor.RED)) {
      // Increment consecutive stones count
      consecutive++;
    }
    // Check if cell is empty
    else if (boardMatrix.board[i][j] == 0) {
      // Check if there were any consecutive stones before this empty cell
      if (consecutive > 0) {
        // Consecutive set is not blocked by opponent, decrement block count
        blocks--;
        // Get consecutive set score
        score += this.getConsecutiveSetScore(
          consecutive,
          blocks,
          forBlues == playersTurn
        );
        // Reset consecutive stone count
        consecutive = 0;
        // Current cell is empty, next consecutive set will have at most 1 blocked side.
        blocks = 1;
      } else {
        // No consecutive stones.
        // Current cell is empty, next consecutive set will have at most 1 blocked side.
        blocks = 1;
      }
    }
    // Cell is occupied by opponent
    // Check if there were any consecutive stones before this empty cell
    else if (consecutive > 0) {
      // Get consecutive set score
      score += this.getConsecutiveSetScore(
        consecutive,
        blocks,
        forBlues == playersTurn
      );
      // Reset consecutive stone count
      consecutive = 0;
      // Current cell is occupied by opponent, next consecutive set may have 2 blocked sides
      blocks = 2;
    } else {
      // Current cell is occupied by opponent, next consecutive set may have 2 blocked sides
      blocks = 2;
    }
    return { consecutive, blocks, score };
  }

  // This function calculates the score by evaluating the stone positions in vertical direction
  // The procedure is the exact same of the horizontal one.
  evaluateVertical(
    boardMatrix: BoardMatrix,
    forBlack: boolean,
    playersTurn: boolean
  ): number {
    let consecutive = 0;
    let blocks = 2;
    let score = 0;

    for (let j = 0; j < boardMatrix.board[0].length; j++) {
      for (let i = 0; i < boardMatrix.board.length; i++) {
        if (boardMatrix.board[i][j] === (forBlack ? EColor.BLUE : EColor.RED)) {
          consecutive++;
        } else if (boardMatrix.board[i][j] == 0) {
          if (consecutive > 0) {
            blocks--;
            score += this.getConsecutiveSetScore(
              consecutive,
              blocks,
              forBlack == playersTurn
            );
            consecutive = 0;
            blocks = 1;
          } else {
            blocks = 1;
          }
        } else if (consecutive > 0) {
          score += this.getConsecutiveSetScore(
            consecutive,
            blocks,
            forBlack == playersTurn
          );
          consecutive = 0;
          blocks = 2;
        } else {
          blocks = 2;
        }
      }
      if (consecutive > 0) {
        score += this.getConsecutiveSetScore(
          consecutive,
          blocks,
          forBlack == playersTurn
        );
      }
      consecutive = 0;
      blocks = 2;
    }
    return score;
  }

  // This function calculates the score by evaluating the stone positions in diagonal directions
  // The procedure is the exact same of the horizontal calculation.
  evaluateDiagonal(
    boardMatrix: BoardMatrix,
    forBlack: boolean,
    playersTurn: boolean
  ): number {
    let consecutive = 0;
    let blocks = 2;
    let score = 0;
    // From bottom-left to top-right diagonally
    for (let k = 0; k <= 2 * (boardMatrix.board.length - 1); k++) {
      const iStart = Math.max(0, k - boardMatrix.board.length + 1);
      const iEnd = Math.min(boardMatrix.board.length - 1, k);
      for (let i = iStart; i <= iEnd; ++i) {
        const j = k - i;
        const __ret = this.extracted(
          boardMatrix,
          i,
          j,
          forBlack,
          consecutive,
          blocks,
          score,
          playersTurn
        );
        consecutive = __ret.consecutive;
        blocks = __ret.blocks;
        score = __ret.score;
      }
      if (consecutive > 0) {
        score += this.getConsecutiveSetScore(
          consecutive,
          blocks,
          forBlack == playersTurn
        );
      }
      consecutive = 0;
      blocks = 2;
    }
    // From top-left to bottom-right diagonally
    for (
      let k = 1 - boardMatrix.board.length;
      k < boardMatrix.board.length;
      k++
    ) {
      const iStart = Math.max(0, k);
      const iEnd = Math.min(
        boardMatrix.board.length + k - 1,
        boardMatrix.board.length - 1
      );
      for (let i = iStart; i <= iEnd; ++i) {
        const j = i - k;
        const __ret = this.extracted(
          boardMatrix,
          i,
          j,
          forBlack,
          consecutive,
          blocks,
          score,
          playersTurn
        );
        consecutive = __ret.consecutive;
        blocks = __ret.blocks;
        score = __ret.score;
      }
      if (consecutive > 0) {
        score += this.getConsecutiveSetScore(
          consecutive,
          blocks,
          forBlack == playersTurn
        );
      }
      consecutive = 0;
      blocks = 2;
    }
    return score;
  }

  // This function calculates the relative score of the white player against the black.
  // (i.e. how likely is white player to win the game before the black player)
  // This value will be used as the score in the Minimax algorithm.

  evaluateNode(board: IBoard, turn: EColor): void {
    if (board instanceof BoardMatrix) {
      this.evaluateBoardForRed(board, turn === EColor.BLUE);
      return;
    }
    throw TypeError;
  }

  checkWin(board: IBoard, turn: EColor) {
    if (board instanceof BoardMatrix) {
      this.evaluateBoardForRed(board, turn === EColor.BLUE);
      return board.score >= this.winScore;
    }
    throw TypeError;
  }
}
