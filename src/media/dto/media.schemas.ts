import { z } from 'zod';

export const mediaKindSchema = z.enum(['movie', 'series']);

export const createMediaSchema = z.object({
  titulo: z.string().min(1, 'Titulo e obrigatorio.'),
  tituloOriginal: z.string().min(1, 'Titulo original e obrigatorio.'),
  subtitulo: z.string().min(1, 'Subtitulo e obrigatorio.'),
  sinopse: z.string().min(1, 'Sinopse e obrigatoria.'),
  generos: z
    .array(z.string().min(1, 'Genero invalido.'))
    .min(1, 'Informe pelo menos um genero.'),
  popularidade: z.string().min(1, 'Popularidade e obrigatoria.'),
  votos: z.string().min(1, 'Votos e obrigatorio.'),
  rating: z.number().min(0, 'Rating deve ser no minimo 0.').max(10, 'Rating deve ser no maximo 10.'),
  lancamento: z.string().min(1, 'Lancamento e obrigatorio.'),
  duracao: z.string().min(1, 'Duracao e obrigatoria.'),
  situacao: z.string().min(1, 'Situacao e obrigatoria.'),
  idioma: z.string().min(1, 'Idioma e obrigatorio.'),
  orcamento: z.string().min(1, 'Orcamento e obrigatorio.'),
  receita: z.string().min(1, 'Receita e obrigatoria.'),
  lucro: z.string().min(1, 'Lucro e obrigatorio.'),
  posterUrl: z.url('Poster URL invalida.'),
  kind: mediaKindSchema,
  backgroundUrl: z.url('Background URL invalida.'),
  teaserUrl: z.url('Teaser URL invalida.'),
});

export const updateMediaSchema = createMediaSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Envie ao menos um campo para atualizacao.',
  });

export const mediaIdParamSchema = z.object({
  id: z.uuid('ID invalido. Use um UUID.'),
});

export type CreateMediaDto = z.infer<typeof createMediaSchema>;
export type UpdateMediaDto = z.infer<typeof updateMediaSchema>;
export type MediaIdParamDto = z.infer<typeof mediaIdParamSchema>;
