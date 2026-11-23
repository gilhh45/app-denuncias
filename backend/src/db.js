import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs';

import { config } from './config.js';

/**
 * Banco Postgres. Com DATABASE_URL usa o do Supabase; sem ela (testes e uso
 * local sem internet) usa o PGlite, um Postgres que roda dentro do próprio Node.
 * Os dois lados expõem a mesma interface: query, exec e transaction.
 */
async function abrirConexao() {
  if (config.urlBanco) {
    const { default: pg } = await import('pg');
    // count(*) e sum() voltam como bigint/numeric (texto); aqui sempre cabem em number
    pg.types.setTypeParser(20, Number);
    pg.types.setTypeParser(1700, Number);

    const pool = new pg.Pool({
      connectionString: config.urlBanco,
      // o Supabase exige SSL; um Postgres local normalmente não tem
      ssl: /localhost|127\.0\.0\.1/.test(config.urlBanco) ? false : { rejectUnauthorized: false },
      max: 5,
    });
    return {
      query: (sql, params) => pool.query(sql, params),
      exec: (sql) => pool.query(sql),
      async transaction(fn) {
        const cliente = await pool.connect();
        try {
          await cliente.query('BEGIN');
          const resultado = await fn({
            query: (s, p) => cliente.query(s, p),
            exec: (s) => cliente.query(s),
          });
          await cliente.query('COMMIT');
          return resultado;
        } catch (erro) {
          await cliente.query('ROLLBACK');
          throw erro;
        } finally {
          cliente.release();
        }
      },
    };
  }

  if (config.producao) {
    throw new Error('Defina DATABASE_URL (string de conexão do Supabase) no .env.');
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const pglite = new PGlite({ parsers: { 20: Number, 1700: Number } });
  const envolver = (alvo) => ({
    async query(sql, params) {
      const r = await alvo.query(sql, params);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
    exec: (sql) => alvo.exec(sql),
  });
  return {
    ...envolver(pglite),
    transaction: (fn) => pglite.transaction((tx) => fn(envolver(tx))),
  };
}

const conexao = await abrirConexao();

// dentro de transacao() as consultas usam a conexão da transação
const contexto = new AsyncLocalStorage();
const alvo = () => contexto.getStore() ?? conexao;

/** O código escreve ? como no SQLite; o Postgres numera: $1, $2... */
function numerar(sql) {
  let n = 0;
  return sql.replace(/\?/g, () => `$${++n}`);
}

export const db = {
  /** Todas as linhas. */
  async all(sql, ...params) {
    return (await alvo().query(numerar(sql), params)).rows;
  },
  /** Primeira linha (ou undefined). */
  async get(sql, ...params) {
    return (await alvo().query(numerar(sql), params)).rows[0];
  },
  /** INSERT/UPDATE/DELETE. Com "RETURNING id" no SQL, o id volta em `id`. */
  async run(sql, ...params) {
    const r = await alvo().query(numerar(sql), params);
    return { id: r.rows[0]?.id, alteradas: r.rowCount };
  },
  /** Vários comandos de uma vez, sem parâmetros. */
  exec: (sql) => alvo().exec(sql),
};

/** Executa `fn` (async) dentro de uma transação; desfaz tudo se der erro. */
export function transacao(fn) {
  return conexao.transaction((tx) => contexto.run(tx, fn));
}

// cria as tabelas que faltarem (o mesmo arquivo pode ser colado no SQL Editor do Supabase)
await conexao.exec(fs.readFileSync(new URL('../supabase/esquema.sql', import.meta.url), 'utf8'));
