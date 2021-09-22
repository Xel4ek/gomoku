import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { DrawerModule } from '../../directives/drawer/drawer.module';

@NgModule({
  declarations: [GameComponent],
  imports: [CommonModule, DrawerModule],
})
export class GameModule {}
