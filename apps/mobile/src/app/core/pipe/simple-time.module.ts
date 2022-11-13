import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleTimePipe } from './simple-time.pipe';

@NgModule({
  declarations: [SimpleTimePipe],
  imports: [CommonModule],
  exports: [SimpleTimePipe],
})
export class SimpleTimeModule {}
