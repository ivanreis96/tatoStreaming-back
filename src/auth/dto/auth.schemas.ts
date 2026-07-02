import { z } from 'zod';

const passwordMessage =
  'A senha deve ter pelo menos 8 caracteres, 1 numero e 1 caractere especial.';

export const registerSchema = z.object({
  displayName: z
    .string({ message: 'Nome de exibicao e obrigatorio.' })
    .min(2, 'Nome de exibicao deve ter no minimo 2 caracteres.'),
  email: z
    .string({ message: 'E-mail e obrigatorio.' })
    .email('E-mail invalido.'),
  password: z
    .string({ message: 'Senha e obrigatoria.' })
    .min(8, passwordMessage)
    .regex(/\d/, passwordMessage)
    .regex(/[^A-Za-z0-9]/, passwordMessage),
  avatarUrl: z.string().url('Avatar invalido.').optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'E-mail e obrigatorio.' })
    .email('E-mail invalido.'),
  password: z.string({ message: 'Senha e obrigatoria.' }).min(1, 'Senha e obrigatoria.'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
