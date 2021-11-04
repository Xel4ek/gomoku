import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'gomoku-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent {
  constructor() {
    const worker = new Worker("./assets/ai-worker.worker.js");
    worker.onmessage = console.log;
    worker.postMessage("text");
  }
}
