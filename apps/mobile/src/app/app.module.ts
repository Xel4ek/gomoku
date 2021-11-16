import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TUI_SANITIZER,
  TuiDialogModule,
  TuiModeModule,
  TuiNotificationsModule,
  TuiRootModule,
  TuiThemeNightModule,
} from '@taiga-ui/core';
import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { WelcomeModule } from './core/components/welcome/welcome.module';
import { SettingsModule } from './core/components/settings/settings.module';
import { GameModule } from './core/components/game/game.module';
import { AboutModule } from './core/components/about/about.module';
import { BoardService } from './core/services/board/board.service';
import { AiService } from "./core/services/ai/ai.service";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    TuiRootModule,
    BrowserAnimationsModule,
    // HammerModule,
    TuiDialogModule,
    TuiNotificationsModule,
    AppRoutingModule,
    WelcomeModule,
    SettingsModule,
    GameModule,
    AboutModule,
    TuiThemeNightModule,
    TuiModeModule,
  ],
  providers: [
    { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private readonly aiService: AiService) {}
}
