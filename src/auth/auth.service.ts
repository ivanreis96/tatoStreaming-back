import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import type { AuthSession, LoginDto, RefreshTokenDto, RegisterDto, UserProfile } from './dto/auth.schemas';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Já existe usuário com este e-mail.');
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

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.createSession(
      user.id,
      user.email,
      user.displayName,
      user.avatarUrl ?? undefined,
    );
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthSession> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
      secret: this.getRefreshSecret(),
    });

    const user = await this.usersService.findById(payload.sub);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const refreshTokenMatches = await compare(dto.refreshToken, user.refreshTokenHash);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    return this.createSession(
      user.id,
      user.email,
      user.displayName,
      user.avatarUrl ?? undefined,
    );
  }

  async me(userId: string): Promise<UserProfile> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return this.toUserProfile(user.id, user.email, user.displayName, user.avatarUrl ?? undefined);
  }

  private async createSession(
    userId: string,
    email: string,
    displayName: string,
    avatarUrl?: string,
  ): Promise<AuthSession> {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.getRefreshSecret(),
    });

    const refreshTokenHash = await hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      user: this.toUserProfile(userId, email, displayName, avatarUrl),
    };
  }

  private toUserProfile(
    id: string,
    email: string,
    displayName: string,
    avatarUrl?: string,
  ): UserProfile {
    return {
      id,
      email,
      displayName,
      avatarUrl,
    };
  }

  private getRefreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'dev_jwt_secret';
  }
}
