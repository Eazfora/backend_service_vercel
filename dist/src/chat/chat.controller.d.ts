import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getResponse(body: {
        message: string;
    }): Promise<{
        reply: any;
    }>;
}
