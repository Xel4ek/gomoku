import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoardPrinterService {

  constructor() {
  }

  printBitBoard(board: bigint, size: number) {
    const str = board.toString(2)
      .replaceAll("0", ".")
      .split('')
      .reverse()
      .map((value, index) => {
        if (index > 0 && index % 8 === 0) {
          value = '\n' + value
        }
        return value
      })
    return str.join('');
  }

}
