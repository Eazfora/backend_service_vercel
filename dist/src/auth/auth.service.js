"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(email, password, name) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('Email sudah terdaftar');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
                role: 'USER',
            },
        });
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async login(email, pass) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('❌ LOGIN GAGAL: Email tidak ditemukan ->', email);
            throw new common_1.UnauthorizedException('Email atau password salah');
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            console.log('❌ LOGIN GAGAL: Password tidak cocok untuk user ->', email);
            console.log('Input:', pass, 'DB Hash:', user.password);
            throw new common_1.UnauthorizedException('Email atau password salah');
        }
        console.log('✅ LOGIN BERHASIL untuk user ->', email);
        const payload = { sub: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload);
        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: String(userId) },
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return { id: user.id, email: user.email, name: user.name, role: user.role };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map