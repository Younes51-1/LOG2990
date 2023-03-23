import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { CreationDialogComponent } from '@app/components/creation-dialog/creation-dialog.component';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameScoreboardComponent } from '@app/components/game-scoreboard/game-scoreboard.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ConfigSelectPageComponent } from '@app/pages/config-select-page/config-select-page.component';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { VideoReplayDialogComponent } from './components/video-replay-dialog/video-replay-dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        GameScoreboardComponent,
        ChatBoxComponent,
        GameCardComponent,
        CreationGamePageComponent,
        ConfigParamsComponent,
        EndgameDialogComponent,
        CreationDialogComponent,
        ConfigSelectPageComponent,
        WaitingRoomComponent,
        DeleteDialogComponent,
        VideoReplayDialogComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        SlickCarouselModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatDialogModule,
        ColorPickerModule,
        MatSliderModule,
    ],
})
export class AppModule {}
