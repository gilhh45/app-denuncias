// a chave padrão está no repositório público: com ela qualquer um assina um token de admin
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Defina JWT_SECRET no .env antes de rodar em produção.');
}

export const config = {
  porta: Number(process.env.PORT ?? 3333),
  producao: process.env.NODE_ENV === 'production',
  teste: process.env.NODE_ENV === 'test',
  jwtSegredo: process.env.JWT_SECRET ?? 'denuncieja-chave-local',
  jwtValidade: '7d',
  arquivoBanco: process.env.DATABASE_FILE ?? 'dados/denuncieja.db',
  pastaUploads: process.env.UPLOADS_DIR ?? 'uploads',
};
