import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';

describe('SocketTestHelper', () => {
    let socketTestHelper: SocketTestHelper;
    beforeEach(() => {
        socketTestHelper = TestBed.inject(SocketTestHelper);
    });

    it('should be created', () => {
        expect(socketTestHelper).toBeTruthy();
    });

    it('should return undefined after calling emit', () => {
        expect(socketTestHelper.emit('hello')).toBeUndefined();
    });

    it('should return undefined after calling disconnect', () => {
        expect(socketTestHelper.disconnect()).toBeUndefined();
    });

    it('should return undefined on peerSideEmit if no event', () => {
        expect(socketTestHelper.peerSideEmit('')).toBeUndefined();
    });

    it('should return undefined on peerSideEmit if event', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        socketTestHelper.on('hello', () => ({}));
        expect(socketTestHelper.peerSideEmit('hello')).toBeUndefined();
    });

    it('should return undefined on on', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(socketTestHelper.on('hello', () => ({}))).toBeUndefined();
    });

    it('should return undefined on off', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(socketTestHelper.off('hello', () => ({}))).toBeUndefined();
    });
});
