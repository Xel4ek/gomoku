import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { CanvasSpace, Create, Group, Line, Pt, Rectangle } from 'pts';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { GameService } from '../../services/game/game.service';
import { Player, PlayerType } from '../../interfaces/player';
import { GameBoard } from '../../interfaces/gameBoard';

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
    // private readonly localStorageService: LocalStorageService,
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
    const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.9);
    const ctx = this.elementRef.nativeElement.getContext('2d');
    if (ctx) {
      ctx.canvas.width = size;
      ctx.canvas.height = size;
    }
    this.space = new CanvasSpace(this.elementRef.nativeElement);
    this.space.setup({ bgcolor: 'rgba(255,255,255,0)' });
    const form = this.space.getForm();
    const lines: Group[] = [];
    let radius = 0;
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
          radius = (this.pts.p2.x - this.pts.p1.x) * 0.42;
          const b = this.space.innerBound;
          const size = this.board.size * 2 - 1;
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
        const current =
          this.board.id % 2 ? this.board.enemy : this.board.player;
        if (
          Rectangle.withinBound(this.space.innerBound, t) &&
          current.type === PlayerType.HUMAN &&
          !this.board.winner
        ) {
          form
            .dash()
            .strokeOnly(current.color + '1)', 2)
            .point(this.pts[0], radius, 'circle');
          form
            .fillOnly(current.color + '0.3)')
            .point(this.pts.p1, radius, 'circle');
        }
        form.fillOnly(this.board.player.color + '1)').points(
          this.board.player.map.map(
            (id) => this.pts.find((e) => e.id === id.toString()) ?? this.pts.p1
          ),
          radius * 1.1,
          'circle'
        );
        form.fillOnly(this.board.enemy.color + '1)').points(
          this.board.enemy.map.map(
            (id) => this.pts.find((e) => e.id === id.toString()) ?? this.pts.p1
          ),
          radius * 1.1,
          'circle'
        );
        if (this.board.winner) {
          form.strokeOnly('rgba(255,255,255,0.7)', 3).points(
            this.board.winner.combination.map(
              (id) =>
                this.pts.find((e) => e.id === id.toString()) ?? this.pts.p1
            ),
            radius * 1.1,
            'circle'
          );
        }
        const fields: (keyof GameBoard)[] = ['player', 'enemy'];
        fields.map((key: keyof GameBoard) => {
          if (this.board) {
            const board: Player = this.board[key] as Player;
            board.map.map((id, index) => {
              form
                .fillOnly('rgba(255,255,255,0.7)')
                .font(radius, 'bold')
                .alignText('center', 'middle')
                .text(
                  this.pts.find((e) => e.id === id.toString()) ?? this.pts.p1,
                  board.turn[index].toString() ?? '',
                  radius * 2
                );
            });
          }
        });
      },
      action: (type) => {
        if (
          (type === 'drop' || type === 'up') &&
          Rectangle.withinBound(this.space.innerBound, this.space.pointer) &&
          this.board &&
          !this.board.winner
        ) {
          const current =
            this.board.id % 2 ? this.board.enemy : this.board.player;
          if (
            !this.board.player.map.includes(+this.pts.p1.id) &&
            !this.board.enemy.map.includes(+this.pts.p1.id) &&
            !this.board.blocked.includes(+this.pts.p1.id) &&
            current.type === PlayerType.HUMAN
          ) {
            current.map.push(+this.pts.p1.id);
            // this.board.id++;
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
