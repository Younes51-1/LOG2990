import { ChatService } from '@app/services/chat/chat.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';

describe('ChatService', () => {
    let chatService: ChatService;
    let socketService: CommunicationSocketService;

    beforeEach(() => {
        socketService = jasmine.createSpyObj('CommunicationSocketService', ['on', 'send']);
        chatService = new ChatService(socketService);
    });

    it('should create', () => {
        expect(chatService).toBeTruthy();
    });

    it('should handle socket', () => {
        const message = { text: 'hello', user: 'user', time: 123 };
        const spy = jasmine.createSpy('spy');
        chatService.message$.subscribe(spy);
        chatService.handleSocket();
        expect(socketService.on).toHaveBeenCalledWith('message', jasmine.any(Function));
        const handler = (socketService.on as jasmine.Spy).calls.mostRecent().args[1];
        handler(message);
        expect(spy).toHaveBeenCalledWith(message);
    });

    it('should send message', () => {
        chatService.sendMessage('hello', 'user', 'room');
        expect(socketService.send).toHaveBeenCalledWith('sendMessage', ['hello', 'user', 'room']);
    });

    it('should set isTyping', () => {
        chatService.setIsTyping(true);
        expect(chatService.getIsTyping()).toBeTrue();
    });
});
