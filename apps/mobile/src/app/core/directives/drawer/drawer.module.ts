import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerDirective } from './drawer.directive';

@NgModule({
  declarations: [DrawerDirective],
  exports: [DrawerDirective],
  imports: [CommonModule],
})
export class DrawerModule {}
