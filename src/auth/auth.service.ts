import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.schemas';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Ja existe usuario com este e-mail.');
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.usersService.create({
      displayName: dto.displayName,
      email: dto.email,
      passwordHash,
      avatarUrl: dto.avatarUrl,
    });

    return this.createSession(
      user.id,
      user.email,
      user.displayName,
      user.avatarUrl ?? undefined,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    return this.createSession(user.id, user.email, user.displayName, user.avatarUrl ?? undefined);
  }

  private async createSession(
    userId: string,
    email: string,
    displayName: string,
    avatarUrl?: string,
  ) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      user: {
        id: userId,
        email,
        displayName,
        avatarUrl,
      },
    };
  }
}
