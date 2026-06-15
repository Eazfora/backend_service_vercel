import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
}
