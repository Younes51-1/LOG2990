import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationSocketService {
    // code imported from https://gitlab.com/nikolayradoev/socket-io-exemple
    socket: Socket;

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        // eslint-disable-next-line no-console
        console.log('socket connecting');
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
        this.socket.emit('connection', 'test');
        // eslint-disable-next-line no-console
        console.log('socket connected');
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
