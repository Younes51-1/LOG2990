import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'config', component: ConfigPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'selection', component: SelectionPageComponent },
    { path: 'creation', component: CreationGamePageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
