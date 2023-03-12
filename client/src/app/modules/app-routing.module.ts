import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ConfigSelectPageComponent } from '@app/pages/config-select-page/config-select-page.component';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'config', component: ConfigSelectPageComponent, data: { page: 'config' } },
    { path: 'selection', component: ConfigSelectPageComponent, data: { page: 'selection' } },
    { path: 'game', component: GamePageComponent },
    { path: 'creation', component: CreationGamePageComponent },
    { path: 'waiting', component: WaitingRoomComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
