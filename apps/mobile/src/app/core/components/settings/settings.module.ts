import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { RouterModule } from '@angular/router';
import { TuiButtonModule } from '@taiga-ui/core';

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, RouterModule, TuiButtonModule],
  exports: [SettingsComponent],
})
export class SettingsModule {}
