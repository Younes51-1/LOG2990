import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MatExpansionModule } from '@angular/material/expansion';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { ModalDialogComponent } from './components/modal-dialog/modal-dialog.component';
import { ConfigSelectPageComponent } from './pages/config-select-page/config-select-page.component';
import { WaitingPageComponent } from './pages/waiting-page/waiting-page.component';

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
        OpponentSidebarComponent,
        GameCardComponent,
        CreationGamePageComponent,
        ConfigParamsComponent,
        EndgameDialogComponent,
        ModalDialogComponent,
        ConfigSelectPageComponent,
        WaitingPageComponent,
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
    ],
})
export class AppModule {}
