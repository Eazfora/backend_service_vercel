import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(email: string, password: string, name?: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>;
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    validateUser(userId: number): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
}
