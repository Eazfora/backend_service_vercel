"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    var _a, _b;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
    console.log(`🚀 NestJS running on http://localhost:${(_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map