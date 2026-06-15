import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }[]>;
    create(data: Prisma.UserCreateInput): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        email: string;
    }>;
}
