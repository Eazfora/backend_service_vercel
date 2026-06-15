import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat') 
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getResponse(@Body() body: { message: string }) {
    if (!body || !body.message) {
      throw new BadRequestException('Pesan tidak boleh kosong!');
    }
    
    // Panggil service yang mengarah ke Python .pkl
    return await this.chatService.getChatResponse(body.message);
  }
}