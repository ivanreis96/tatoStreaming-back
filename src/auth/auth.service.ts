import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import type { AuthMessageResponse, AuthSession, ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto, UserProfile, } from './dto/auth.schemas';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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

  async forgotPassword(dto: ForgotPasswordDto): Promise<AuthMessageResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return { message: 'Se o e-mail existir, enviaremos as instruções de recuperação.' };
    }

    const resetToken = this.generateResetPasswordToken();
    const resetPasswordTokenHash = this.hashResetPasswordToken(resetToken);
    const resetPasswordTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.usersService.updateResetPasswordToken(
      user.id,
      resetPasswordTokenHash,
      resetPasswordTokenExpiresAt,
    );

    try {
      await this.sendResetPasswordEmail(user.email, resetToken);
    } catch (error) {
      this.logger.error('Falha ao enviar e-mail de recuperação de senha.', error);
    }

    return { message: 'Se o e-mail existir, enviaremos as instruções de recuperação.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<AuthMessageResponse> {
    const resetPasswordTokenHash = this.hashResetPasswordToken(dto.token);
    const user = await this.usersService.findByResetPasswordTokenHash(resetPasswordTokenHash);

    if (!user?.resetPasswordTokenExpiresAt) {
      throw new UnauthorizedException('Link de redefinição inválido ou expirado.');
    }

    if (user.resetPasswordTokenExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Link de redefinição inválido ou expirado.');
    }

    const passwordHash = await hash(dto.password, 10);

    await this.usersService.updatePasswordAndClearResetState(user.id, passwordHash);

    return { message: 'Senha redefinida com sucesso.' };
  }

  private generateResetPasswordToken() {
    return randomBytes(32).toString('hex');
  }

  private hashResetPasswordToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getResetPasswordUrl(token: string) {
    const resetPasswordBaseUrl =
      process.env.RESET_PASSWORD_URL_BASE ?? 'http://localhost:5173/reset-password';

    return `${resetPasswordBaseUrl}?token=${encodeURIComponent(token)}`;
  }

  private async sendResetPasswordEmail(email: string, token: string) {
    const emailProvider = process.env.EMAIL_PROVIDER ?? 'mailhog';

    if (emailProvider !== 'mailhog') {
      this.logger.warn(
        `EMAIL_PROVIDER '${emailProvider}' não suportado no modo atual. Usando apenas Mailhog.`,
      );
      return;
    }

    const host = process.env.SMTP_HOST ?? 'localhost';
    const port = Number(process.env.SMTP_PORT ?? 1025);
    const secure = String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';
    const from = process.env.SMTP_FROM ?? 'Tato Streaming <no-reply@tato.local>';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
    });

    const resetPasswordUrl = this.getResetPasswordUrl(token);

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Recuperação de senha - Tato Streaming',
      text: `Recebemos uma solicitação para redefinir sua senha.\n\nUse o link abaixo para continuar:\n${resetPasswordUrl}\n\nSe você não solicitou essa alteração, ignore este e-mail.`,
      html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetPasswordUrl}">Clique aqui para redefinir sua senha</a></p><p>Se você não solicitou essa alteração, ignore este e-mail.</p>`,
    });

    this.logger.log(`E-mail de recuperação enviado para ${email}.`);
  }
}
