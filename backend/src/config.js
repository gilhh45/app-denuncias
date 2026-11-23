// a chave padrão está no repositório público: com ela qualquer um assina um token de admin
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Defina JWT_SECRET no .env antes de rodar em produção.');
}

export const config = {
  porta: Number(process.env.PORT ?? 3333),
  producao: process.env.NODE_ENV === 'production',
  teste: process.env.NODE_ENV === 'test',
  // sem envio de e-mail, o código de recuperação aparece na tela (útil para apresentar)
  modoDemo: process.env.NODE_ENV !== 'production' || process.env.MODO_DEMO === '1',
  jwtSegredo: process.env.JWT_SECRET ?? 'denuncieja-chave-local',
  jwtValidade: '7d',
  // string de conexão do Supabase (Connect → Session pooler); vazia = Postgres embutido (PGlite)
  urlBanco: process.env.DATABASE_URL || null,
  // Storage do Supabase para os prints; sem isso, eles ficam na pasta uploads/
  supabaseUrl: process.env.SUPABASE_URL?.replace(/\/+$/, '') || null,
  supabaseChave: process.env.SUPABASE_SECRET_KEY || null,
  bucket: process.env.SUPABASE_BUCKET || 'evidencias',
  pastaUploads: process.env.UPLOADS_DIR ?? 'uploads',
};
