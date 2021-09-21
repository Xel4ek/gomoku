import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './welcome.component';
import { TuiButtonModule } from '@taiga-ui/core';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [CommonModule, TuiButtonModule, RouterModule],
  exports: [WelcomeComponent],
})
export class WelcomeModule {}
