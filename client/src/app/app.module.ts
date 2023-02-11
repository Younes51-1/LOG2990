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
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MatExpansionModule } from '@angular/material/expansion';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { MatDialogModule } from '@angular/material/dialog';

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
        SelectionPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        GameCardComponent,
        ConfigPageComponent,
        CreationGamePageComponent,
        ConfigParamsComponent,
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
