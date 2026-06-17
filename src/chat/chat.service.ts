import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatService {
  async getChatResponse(message: string) {
    try {
      // PERBAIKAN UTAMA: Ubah localhost menjadi 127.0.0.1
      const pythonResponse = await axios.post(
        'https://capstone-ai-vercel.vercel.app/chat',
        {
          message: message,
        },
      );

      if (pythonResponse.data && pythonResponse.data.status === 'success') {
        return {
          reply: pythonResponse.data.reply,
        };
      }
      return { reply: 'Maaf, respon dari server AI tidak valid.' };
    } catch (error: any) {
      // Log ini akan muncul di terminal NestJS Anda jika koneksi masih gagal
      console.error(
        '❌ Gagal menyambungkan ChatService ke Python:',
        error.message,
      );
      return {
        reply: 'Maaf, saya gagal terhubung dengan database AI di port 8000.',
      };
    }
  }
}
