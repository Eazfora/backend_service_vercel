import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        name: string;
        id: string;
        email: string;
        role: string;
        createdAt: Date;
    }[]>;
    create(createUserDto: Prisma.UserCreateInput): Promise<{
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
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<{
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
