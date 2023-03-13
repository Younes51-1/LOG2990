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
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog.component';
import { ConfigSelectPageComponent } from './pages/config-select-page/config-select-page.component';
import { WaitingRoomComponent } from './components/waiting-room-dialog/waiting-room-dialog.component';
import { OpponentSidebarComponent } from './components/opponent-sidebar/opponent-sidebar.component';

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
        SidebarComponent,
        GameCardComponent,
        CreationGamePageComponent,
        ConfigParamsComponent,
        EndgameDialogComponent,
        ModalDialogComponent,
        ConfigSelectPageComponent,
        WaitingRoomComponent,
        OpponentSidebarComponent,
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
