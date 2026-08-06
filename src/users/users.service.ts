import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
  displayName: string;
  email: string;
  passwordHash: string;
  refreshTokenHash?: string | null;
  avatarUrl?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  updateResetPasswordToken(
    id: string,
    resetPasswordTokenHash: string,
    resetPasswordTokenExpiresAt: Date,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        resetPasswordTokenHash,
        resetPasswordTokenExpiresAt,
      },
    });
  }

  findByResetPasswordTokenHash(resetPasswordTokenHash: string) {
    return this.prisma.user.findFirst({
      where: { resetPasswordTokenHash },
    });
  }

  updatePasswordAndClearResetState(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
        refreshTokenHash: null,
      },
    });
  }

  create(input: CreateUserInput) {
    return this.prisma.user.create({ data: input });
  }
}
