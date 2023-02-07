import { Component } from '@angular/core';

@Component({
    selector: 'app-endgame-modal-dialog',
    templateUrl: './endgame-dialog.component.html',
    styleUrls: ['./endgame-dialog.component.scss'],
})
export class EndgameDialogComponent {
    onCloseClick() {
        window.location.href = '/home';
    }
}
