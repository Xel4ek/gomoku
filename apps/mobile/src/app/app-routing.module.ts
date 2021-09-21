import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './core/components/welcome/welcome.component';
import { AboutComponent } from './core/components/about/about.component';
import { SettingsComponent } from './core/components/settings/settings.component';
import { GameComponent } from './core/components/game/game.component';
const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'game',
    component: GameComponent,
  },
  {
    path: '**',
    redirectTo: 'welcome',
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
