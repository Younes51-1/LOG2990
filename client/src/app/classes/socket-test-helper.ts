type CallbackSignature = (params: any) => {}

export class SocketTestHelper {
    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);
    }

    emit(event: string, ...params: any): void {
        return;
    }

    disconnect(): void { return; }

    peerSideEmit(event: string, params?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}