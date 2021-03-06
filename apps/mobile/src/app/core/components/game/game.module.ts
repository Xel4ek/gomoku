import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { DrawerModule } from '../../directives/drawer/drawer.module';
import { TuiButtonModule } from '@taiga-ui/core';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [GameComponent],
  imports: [CommonModule, DrawerModule, TuiButtonModule, RouterModule],
})
export class GameModule {}
