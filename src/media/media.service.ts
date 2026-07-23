import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateMediaDto, Media, UpdateMediaDto } from './dto/media.schemas';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateMediaDto) {
    return this.prisma.media.create({
      data: {
        ...dto,
        createdById: userId,
      },
    }).then((media) => this.toMedia(media));
  }

  findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    }).then((medias) => medias.map((media) => this.toMedia(media)));
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Filme/serie nao encontrado.');
    }

    return this.toMedia(media);
  }

  async update(id: string, userId: string, dto: UpdateMediaDto) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Filme/serie nao encontrado.');
    }

    if (media.createdById !== userId) {
      throw new ForbiddenException('Voce nao pode editar este filme/serie.');
    }

    return this.prisma.media.update({
      where: { id },
      data: dto,
    }).then((updatedMedia) => this.toMedia(updatedMedia));
  }

  async remove(id: string, userId: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Filme/serie nao encontrado.');
    }

    if (media.createdById !== userId) {
      throw new ForbiddenException('Voce nao pode excluir este filme/serie.');
    }

    await this.prisma.media.delete({ where: { id } });

    return {
      message: 'Filme/serie excluido com sucesso.',
    };
  }
 
  private toMedia(media: {
    id: string;
    titulo: string;
    tituloOriginal: string;
    subtitulo: string;
    sinopse: string;
    generos: string[];
    popularidade: string;
    votos: string;
    rating: number;
    lancamento: string;
    duracao: string;
    situacao: 'lancado' | 'producao' | 'encerrada' ;
    idioma: string;
    orcamento: string;
    receita: string;
    lucro: string;
    posterUrl: string;
    kind: 'movie' | 'series';
    backgroundUrl: string;
    teaserUrl: string;
    createdById: string;
  }): Media {
    return {
      id: media.id,
      createdBy: media.createdById,
      titulo: media.titulo,
      tituloOriginal: media.tituloOriginal,
      subtitulo: media.subtitulo,
      sinopse: media.sinopse,
      generos: media.generos,
      popularidade: media.popularidade,
      votos: media.votos,
      rating: media.rating,
      lancamento: media.lancamento,
      duracao: media.duracao,
      situacao: media.situacao,
      idioma: media.idioma,
      orcamento: media.orcamento,
      receita: media.receita,
      lucro: media.lucro,
      posterUrl: media.posterUrl,
      kind: media.kind,
      backgroundUrl: media.backgroundUrl,
      teaserUrl: media.teaserUrl,
    };
  }
}
