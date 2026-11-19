export const config = {
  porta: Number(process.env.PORT ?? 3333),
  producao: process.env.NODE_ENV === 'production',
  jwtSegredo: process.env.JWT_SECRET ?? 'denuncieja-chave-local',
  jwtValidade: '7d',
  arquivoBanco: process.env.DATABASE_FILE ?? 'dados/denuncieja.db',
  pastaUploads: process.env.UPLOADS_DIR ?? 'uploads',
};
