import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.schemas';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateMediaDto) {
    return this.prisma.media.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });
  }

  findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Filme/serie nao encontrado.');
    }

    return media;
  }

  async update(id: string, userId: string, dto: UpdateMediaDto) {
    const media = await this.findById(id);

    if (media.createdById !== userId) {
      throw new ForbiddenException('Voce nao pode editar este filme/serie.');
    }

    return this.prisma.media.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const media = await this.findById(id);

    if (media.createdById !== userId) {
      throw new ForbiddenException('Voce nao pode excluir este filme/serie.');
    }

    await this.prisma.media.delete({ where: { id } });

    return {
      message: 'Filme/serie excluido com sucesso.',
    };
  }
}
