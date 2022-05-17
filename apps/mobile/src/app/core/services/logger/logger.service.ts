import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  debug = true;

  constructor() { }

  log(message: any) {
    if (this.debug) {
      console.log(message);
    }
  }
}
