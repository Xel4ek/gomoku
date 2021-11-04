import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { CanvasSpace, Create, Group, Line, Pt, Rectangle } from 'pts';
import { GameBoard } from "../../services/ai/ai.service";
import { Subject } from "rxjs";
import { LocalStorageService } from "../../services/local-storage/local-storage.service";

@Directive({
  selector: '[gomokuDrawer]',
})
export class DrawerDirective implements AfterViewInit {
  space: CanvasSpace;
  subject: Subject<GameBoard>;
  gameBoard: GameBoard;
  player: number[][] = [];
  enemy: number[][] = [];
  busy: string[] = [];
  pts = new Group();


  constructor(private readonly elementRef: ElementRef<HTMLCanvasElement>,
              private readonly localStorageService: LocalStorageService) {
    this.space = new CanvasSpace(this.elementRef.nativeElement);
    this.subject = this.localStorageService.subject;
    this.gameBoard = {
      id: 0,
      opp: [],
      player: [],
      size: this.gameSize,
      stat: undefined,
      timestamp: Date.now(),
      lastMove: "",
      isPlayer: true,
    };
    this.subject.subscribe(gameBoard => this.onEvent(gameBoard));
  }
  private readonly gameSize = 19;

  onEvent(gameBoard: GameBoard) {
  // console.log(this.player);
    if (!this.gameBoard.isPlayer) {
      if(!this.busy.includes(this.gameBoard.lastMove)) {
        this.busy.push(this.gameBoard.lastMove)
        const pt = this.pts.find(value => value.id === gameBoard.lastMove);
        if (pt) {
          this.enemy.push([...pt]);
        }

      }
    }
  }

  ngAfterViewInit(): void {
    this.space.setup({ bgcolor: 'rgba(255,255,255,0)' });
    const form = this.space.getForm();
    const lines: Group[] = [];
    let playerTurn = true;
    const playerColor = (alpha: number = 1) => 'rgba(69,187,0,' + alpha + ')';
    const enemyColor = (alpha: number = 1) => 'rgba(194,6,6,' + alpha + ')';
    this.space.add({
      animate: () => {
        if (this.pts.length === 0) {
          this.pts = Create.gridPts(this.space.innerBound, this.gameSize, this.gameSize);
          this.pts.map((p, index) => (p.id = index.toString()));
          const b = this.space.innerBound;
          const size = (this.space.innerBound.width / (this.gameSize + 1.25)) * 2;
          const left = Line.subpoints([b.p1, new Pt([b.p1.x, b.q1.y])], size);
          const right = Line.subpoints([new Pt([b.q1.x, b.p1.y]), b.q1], size);
          const top = Line.subpoints([b.p1, new Pt([b.q1.x, b.p1.y])], size);
          const bottom = Line.subpoints([new Pt([b.p1.x, b.q1.y]), b.q1], size);
          for (let i = 0; i < size; i += 2) {
            lines.push(Group.fromArray([left[i], right[i]]));
            lines.push(Group.fromArray([top[i], bottom[i]]));
          }
        }

        const t = this.space.pointer;
        this.pts.sort(
          (a, b) => a.$subtract(t).magnitudeSq() - b.$subtract(t).magnitudeSq()
        );
        // form.fillOnly('#123').points(this.pts, 2, 'circle');
        form.strokeOnly('rgba(255,255,255,0.5)').lines(lines);
        const radius =
          this.space.innerBound.width / (this.gameSize + 1.25) / 2 - 1.2;
        if (Rectangle.withinBound(this.space.innerBound, t)) {
          form
            .dash()
            .strokeOnly(playerTurn ? playerColor() : enemyColor(), 2)
            .point(this.pts[0], radius, 'circle');
          form
            .fillOnly(playerTurn ? playerColor(0.3) : enemyColor(0.3))
            .point(this.pts.p1, radius, 'circle');
        }
        form.fillOnly(playerColor()).points(this.player, radius * 1.1, 'circle');
        form.fillOnly(enemyColor()).points(this.enemy, radius * 1.1, 'circle');
      },
      action: (type, x, y, evt) => {
        if (
          (type === 'drop' || type === 'up') &&
          Rectangle.withinBound(this.space.innerBound, this.space.pointer)
        ) {
          // console.log(space.pointer);
          if (!this.busy.includes(this.pts.p1.id)) {
            this.busy.push(this.pts.p1.id);
            if (playerTurn) {
              this.gameBoard.player.push(this.pts.p1.id);
              // console.log(this.pts.p1);
              this.player.push([...this.pts.p1]);
            } else {
              this.gameBoard.opp.push(this.pts.p1.id);
              this.enemy.push([...this.pts.p1]);
            }
            this.gameBoard.id = this.gameBoard.id + 1;
            this.gameBoard.timestamp = Date.now();
            this.gameBoard.isPlayer = !this.gameBoard.isPlayer;
            this.subject.next(this.gameBoard);
            // BitBoard.fromArray(this.gameBoard.player);
            playerTurn = !playerTurn;
          }
        }
      },
    });

    this.space.bindMouse().bindTouch().play();
  }
}
