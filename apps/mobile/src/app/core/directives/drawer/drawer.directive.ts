import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { CanvasSpace, Create, Group, Line, Pt, Rectangle } from 'pts';
import { GameBoard } from '../../services/ai/ai.service';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { takeUntil, tap } from 'rxjs/operators';
import { GameService, PlayerType } from '../../services/game/game.service';

@Directive({
  selector: '[gomokuDrawer]',
})
export class DrawerDirective implements AfterViewInit, OnDestroy {
  space: CanvasSpace;
  destroy$ = new Subject<void>();
  pts = new Group();
  private board?: GameBoard;

  constructor(
    private readonly elementRef: ElementRef<HTMLCanvasElement>,
    private readonly localStorageService: LocalStorageService,
    private readonly gameService: GameService
  ) {
    this.space = new CanvasSpace(this.elementRef.nativeElement);
    this.gameService
      .sequence$()
      .pipe(
        takeUntil(this.destroy$),
        tap((board) => {
          this.board = board;
        })
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.space.setup({ bgcolor: 'rgba(255,255,255,0)' });
    const form = this.space.getForm();
    const lines: Group[] = [];
    this.space.add({
      animate: () => {
        if (!this.board) {
          throw new Error('broken board');
        }
        if (this.pts.length === 0) {
          this.pts = Create.gridPts(
            this.space.innerBound,
            this.board.size,
            this.board.size
          );
          this.pts.map((p, index) => (p.id = index.toString()));
          const b = this.space.innerBound;
          const size =
            (this.space.innerBound.width / this.board.size - 3.25) * 2;
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
        form.strokeOnly('rgba(255,255,255,0.5)').lines(lines);
        const radius =
          this.space.innerBound.width / (this.board.size + 1.25) / 2 - 1.2;
        const current =
          this.board.id % 2 ? this.board.enemy : this.board.player;
        if (
          Rectangle.withinBound(this.space.innerBound, t) &&
          current.type === PlayerType.HUMAN
        ) {
          form
            .dash()
            .strokeOnly(current.options.color(), 2)
            .point(this.pts[0], radius, 'circle');
          form
            .fillOnly(current.options.color(0.3))
            .point(this.pts.p1, radius, 'circle');
        }
        form.fillOnly(this.board.player.options.color()).points(
          this.board.player.map.map(
            (id) => this.pts.find((e) => e.id === id.toString()) ?? this.pts.p1
          ),
          radius * 1.1,
          'circle'
        );
        form.fillOnly(this.board.enemy.options.color()).points(
          this.board.enemy.map.map(
            (id) => this.pts.find((e) => e.id === id.toString()) ?? this.pts.p1
          ),
          radius * 1.1,
          'circle'
        );
      },
      action: (type) => {
        if (
          (type === 'drop' || type === 'up') &&
          Rectangle.withinBound(this.space.innerBound, this.space.pointer) &&
          this.board
        ) {
          const current =
            this.board.id % 2 ? this.board.enemy : this.board.player;
          if (
            !this.board.player.map.includes(+this.pts.p1.id) &&
            !this.board.enemy.map.includes(+this.pts.p1.id) &&
            current.type === PlayerType.HUMAN
          ) {
            current.map.push(+this.pts.p1.id);
            this.board.id++;
            this.board.timestamp = new Date().getTime();
            this.gameService.makeTurn(this.board);
          }
        }
      },
    });
    this.space.bindMouse().bindTouch().play();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
