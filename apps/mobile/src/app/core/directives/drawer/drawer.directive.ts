import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { CanvasSpace, Create, Group, Line, Pt, Rectangle } from 'pts';

@Directive({
  selector: '[gomokuDrawer]',
})
export class DrawerDirective implements AfterViewInit {
  constructor(private readonly elementRef: ElementRef<HTMLCanvasElement>) {}

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
          pts = Create.gridPts(space.innerBound, 19, 19);
          pts.map((p, index) => (p.id = index.toString()));
          const b = space.innerBound;
          const size = 37;
          const left = Line.subpoints([b.p1, new Pt([b.p1.x, b.q1.y])], size);
          const right = Line.subpoints([new Pt([b.q1.x, b.p1.y]), b.q1], size);
          const top = Line.subpoints([b.p1, new Pt([b.q1.x, b.p1.y])], size);
          const bottom = Line.subpoints([new Pt([b.p1.x, b.q1.y]), b.q1], size);
          for (let i = 0; i < size; i += 2) {
            lines.push(Group.fromArray([left[i], right[i]]));
            lines.push(Group.fromArray([top[i], bottom[i]]));
          }
        }

        const t = space.pointer;
        pts.sort(
          (a, b) => a.$subtract(t).magnitudeSq() - b.$subtract(t).magnitudeSq()
        );
        // form.fillOnly('#123').points(pts, 2, 'circle');
        form.strokeOnly('rgba(255,255,255,0.5)').lines(lines);
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
      },
      action: (type, x, y, evt) => {
        if (
          (type === 'drop' || type === 'up') &&
          Rectangle.withinBound(space.innerBound, space.pointer)
        ) {
          // console.log(space.pointer);
          if (!busy.includes(pts.p1.id)) {
            busy.push(pts.p1.id);
            if (playerTurn) {
              player.push([...pts.p1]);
            } else {
              enemy.push([...pts.p1]);
            }
            playerTurn = !playerTurn;
          }
        }
      },
    });

    space.bindMouse().bindTouch().play();
  }
}
