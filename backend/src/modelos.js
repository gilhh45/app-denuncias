/** Converte uma linha da tabela usuarios no formato enviado ao app (sem a senha). */
export function formatarUsuario(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    papel: linha.papel,
    pontos: linha.pontos,
    bloqueado: !!linha.bloqueado,
    criadoEm: linha.criado_em,
    ultimoAcesso: linha.ultimo_acesso,
  };
}
