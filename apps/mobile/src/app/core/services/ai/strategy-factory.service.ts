import { Injectable } from '@angular/core';
import {NegamaxStrategy} from "./negamax-strategy";

@Injectable({
  providedIn: 'root'
})
export class StrategyFactoryService {

  constructor(private readonly negamaxStrategy: NegamaxStrategy) { }

  get(name: string) {
    return this.negamaxStrategy;
  }
}
