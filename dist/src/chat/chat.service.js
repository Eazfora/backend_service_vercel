"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let ChatService = class ChatService {
    async getChatResponse(message) {
        try {
            const pythonResponse = await axios_1.default.post('http://127.0.0.1:8000/chat', {
                message: message,
            });
            if (pythonResponse.data && pythonResponse.data.status === 'success') {
                return {
                    reply: pythonResponse.data.reply,
                };
            }
            return { reply: 'Maaf, respon dari server AI tidak valid.' };
        }
        catch (error) {
            console.error('❌ Gagal menyambungkan ChatService ke Python:', error.message);
            return { reply: 'Maaf, saya gagal terhubung dengan database AI di port 8000.' };
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)()
], ChatService);
//# sourceMappingURL=chat.service.js.map