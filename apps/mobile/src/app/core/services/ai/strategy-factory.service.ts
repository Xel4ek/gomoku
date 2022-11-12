import { Injectable } from '@angular/core';
// import { NegamaxGenericStrategy } from './negamax-generic-strategy';
import { IBoard } from '../../interfaces/IBoard';
import { NegamaxGenericStrategy } from '../../ai/negamax-generic-strategy';

// @Injectable({
//   providedIn: 'root',
// })
export class StrategyFactoryService {
  get(depth: number) {
    return NegamaxGenericStrategy.getStrategy<IBoard>(depth);
  }
}
