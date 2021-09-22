import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
} from '@angular/core';
import {
  CanvasSpace,
  Create,
  Group,
  IPlayer,
  Num,
  Pt,
  PtLike,
  Rectangle,
} from 'pts';

@Directive({
  selector: '[gomokuDrawer]',
})
export class DrawerDirective implements AfterViewInit {
  constructor(private readonly elementRef: ElementRef<HTMLCanvasElement>) {
    // elementRef.nativeElement.
  }
  // @HostListener('tap', ['$event'])
  // draw(event: HammerInput) {
  //   if (!this.ctx) return;
  //   const { x, y } = event.center;
  //   this.ctx.fillStyle = 'red';
  //   this.ctx.fillRect(x - this.corner.x, y - this.corner.y, 10, 10);
  // }
  ngAfterViewInit(): void {
    const space = new CanvasSpace(this.elementRef.nativeElement);
    space.setup({ bgcolor: 'rgba(255,255,255,0)' });
    const form = space.getForm();
    let pts: Group;
    const player: number[][] = [];
    const enemy: number[][] = [];
    const busy: string[] = [];
    const lines: Group[] = [];
    let playerTurn = true;
    const playerColor = (alpha: number = 1) => 'rgba(69,187,0,' + alpha + ')';
    const enemyColor = (alpha: number = 1) => 'rgba(194,6,6,' + alpha + ')';
    space.add({
      animate: () => {
        if (!pts) {
          pts = Create.gridPts(space.innerBound, 15, 15);
          pts.map((p, index) => {
            p.id = index.toString();
            if (index % 15 === 14) {
              lines.push(Group.fromArray([p, pts[index - 14]]));
            }
            if (index < 15) {
              lines.push(Group.fromArray([p, pts[index + 14 * 15]]));
            }
          });
          // const b = space.innerBound;
          // lines.push(
          //   Create.distributeLinear([b.p1, new Pt([b.p1.x, b.q1.y])], 15)
          // );
          // lines.push(Create.distributeLinear([b.p1, b.q], 15));
        }

        const t = space.pointer;
        pts.sort(
          (a, b) => a.$subtract(t).magnitudeSq() - b.$subtract(t).magnitudeSq()
        );
        // form.fillOnly('#123').points(pts, 2, 'circle');
        form.strokeOnly('#fff').lines(lines);
        if (Rectangle.withinBound(space.innerBound, t)) {
          form
            .dash()
            .strokeOnly(playerTurn ? playerColor() : enemyColor(), 2)
            .point(pts[0], 10, 'circle');
          form
            .fillOnly(playerTurn ? playerColor(0.3) : enemyColor(0.3))
            .point(pts.p1, 10, 'circle');
        }
        form.fillOnly(playerColor()).points(player, 12, 'circle');
        form.fillOnly(enemyColor()).points(enemy, 12, 'circle');
        // form.strokeOnly('#f05', 2).line([pts[0], space.pointer]);
      },
      action: (type, x, y, evt) => {
        // const touchPoints = space.touchesToPoints(evt as TouchEvent);
        // types can be: "up", "down", "move", and "out
        if (
          (type === 'drop' || type === 'up') &&
          Rectangle.withinBound(space.innerBound, space.pointer)
        ) {
          console.log(space.pointer);
          if (!busy.includes(pts.p1.id)) {
            busy.push(pts.p1.id);
            if (playerTurn) {
              player.push([...pts.p1]);
            } else {
              enemy.push([...pts.p1]);
            }
            playerTurn = !playerTurn;
          }
          // console.log(pts, type);
          // touched
        }
      },
    });

    space.bindMouse().bindTouch().play();
  }
}
