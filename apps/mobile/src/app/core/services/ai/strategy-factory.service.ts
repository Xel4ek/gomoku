import { Injectable } from '@angular/core';
import {NegamaxStrategy} from "./negamax-strategy";
import { NegamaxGenericStrategy } from "./negamax-generic-strategy";

@Injectable({
  providedIn: 'root'
})
export class StrategyFactoryService {

  constructor(private readonly negamaxStrategy: NegamaxGenericStrategy<any>) { }

  get(name: string) {
    return this.negamaxStrategy;
  }
}
