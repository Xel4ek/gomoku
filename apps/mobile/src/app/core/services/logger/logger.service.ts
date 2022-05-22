import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  debug = false;

  constructor() { }

  log(message: any) {
    if (this.debug) {
      console.log(message);
    }
  }
}
