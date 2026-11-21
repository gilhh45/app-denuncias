import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import Aviso from '@/components/Aviso';
import BarraProgresso from '@/components/BarraProgresso';
import Botao from '@/components/Botao';
import Cabecalho from '@/components/Cabecalho';
import Campo from '@/components/Campo';
import Chips from '@/components/Chips';
import { SeloPrioridade } from '@/components/CartaoDenunciaAdmin';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import FotoEvidencia from '@/components/FotoEvidencia';
import LinhaDoTempo from '@/components/LinhaDoTempo';
import StatusBadge from '@/components/StatusBadge';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { MOTIVOS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { useDenunciaAdmin, useMudarStatus } from '@/services/admin';
import { ErroApi, urlArquivo } from '@/services/api';
import { espaco, raio } from '@/theme';
import type { MotivoRejeicao } from '@/types';
import { confirmar, corDoScore, formatarData } from '@/utils';

type Decisao = 'EM_ANALISE' | 'CONFIRMADA' | 'REJEITADA';

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Texto variante="legenda">{rotulo}</Texto>
      <Texto variante="destaque" style={estilos.valor}>
        {valor}
      </Texto>
    </View>
  );
}

type Props = {
  /** Na moderação em sequência (navegador) a análise abre ao lado da fila. */
  id?: number;
  /** Chamado depois de confirmar ou rejeitar, para abrir a próxima. */
  aoDecidir?: () => void;
};

export default function AnaliseDenunciaScreen({ id: idEmbutido, aoDecidir }: Props = {}) {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = idEmbutido ?? Number(params.id);
  const embutida = idEmbutido !== undefined;
  const denuncia = useDenunciaAdmin(id);
  const mudar = useMudarStatus(id);
  const [nota, setNota] = useState('');
  const [motivo, setMotivo] = useState<MotivoRejeicao | null>(null);
  const [pedindoMotivo, setPedindoMotivo] = useState(false);
  const [resultado, setResultado] = useState('');
  const [erro, setErro] = useState('');

  async function decidir(status: Decisao) {
    // rejeitar exige motivo: o primeiro toque abre a escolha
    if (status === 'REJEITADA' && !motivo) {
      setPedindoMotivo(true);
      setErro('Escolha o motivo da rejeição.');
      return;
    }
    if (status !== 'EM_ANALISE') {
      const texto =
        status === 'CONFIRMADA'
          ? 'O autor ganha pontos de confiança e a denúncia entra na exportação.'
          : 'O autor perde 20 pontos de confiança.';
      const ok = await confirmar(
        status === 'CONFIRMADA' ? 'Confirmar denúncia?' : 'Rejeitar denúncia?',
        texto,
        status === 'CONFIRMADA' ? 'Confirmar' : 'Rejeitar',
      );
      if (!ok) return;
    }

    setErro('');
    mudar.mutate(
      {
        status,
        nota: nota.trim() || undefined,
        motivo: status === 'REJEITADA' ? (motivo ?? undefined) : undefined,
      },
      {
        onSuccess: ({ variacaoPontos }) => {
          setNota('');
          setMotivo(null);
          setPedindoMotivo(false);
          if (status === 'EM_ANALISE') setResultado('Análise iniciada.');
          else if (variacaoPontos > 0)
            setResultado(`Denúncia confirmada. O autor ganhou ${variacaoPontos} pontos.`);
          else setResultado(`Denúncia rejeitada. O autor perdeu ${-variacaoPontos} pontos.`);
          if (status !== 'EM_ANALISE') aoDecidir?.();
        },
        onError: (e) => setErro(e instanceof ErroApi ? e.message : 'Não foi possível salvar.'),
      },
    );
  }

  // atalhos de teclado na moderação em sequência: C confirma, R rejeita
  const atalho = useEffectEvent((k: string) => {
    if (k === 'c') decidir('CONFIRMADA');
    if (k === 'r') decidir('REJEITADA');
  });
  useEffect(() => {
    if (!embutida || Platform.OS !== 'web') return;
    function tecla(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /INPUT|TEXTAREA/.test(alvo.tagName)) return;
      atalho(e.key.toLowerCase());
    }
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [embutida]);

  if (denuncia.isPending) {
    return (
      <Tela>
        <Cabecalho voltar={!embutida} titulo="Análise" />
        <Carregando />
      </Tela>
    );
  }
  if (denuncia.isError) {
    return (
      <Tela>
        <Cabecalho voltar={!embutida} titulo="Análise" />
        <EstadoVazio
          icone="alert-circle"
          titulo="Denúncia não encontrada"
          texto={denuncia.error.message}
        />
      </Tela>
    );
  }

  const d = denuncia.data;
  const aberta = d.status === 'PENDENTE' || d.status === 'EM_ANALISE';
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <Tela>
      <Cabecalho voltar={!embutida} titulo="Análise" subtitulo={`Protocolo ${d.protocolo}`} />

      <View style={cartao}>
        <View style={estilos.linha}>
          <SeloPrioridade prioridade={d.prioridade} />
          <StatusBadge status={d.status} />
        </View>
        <Texto variante="subtitulo">{d.titulo}</Texto>
        <Linha rotulo="Onde" valor={d.tipo === 'SITE' ? 'Site' : (d.plataforma ?? 'Rede social')} />
        {!!d.perfil && <Linha rotulo="Perfil" valor={d.perfil} />}
        <Linha rotulo="Categoria" valor={d.categoria} />
        <Linha rotulo="Recebida" valor={formatarData(d.criadaEm)} />
      </View>

      <View style={cartao}>
        <Texto variante="rotulo">Autor</Texto>
        <Linha rotulo="Nome" valor={d.autor.nome} />
        <Linha rotulo="Nível de confiança" valor={d.autor.nivel} />
        {d.autor.bloqueado && <Aviso tipo="alerta">Este usuário está bloqueado.</Aviso>}
        <Botao
          titulo="Ver análise do autor"
          icone="user"
          variante="fantasma"
          compacto
          onPress={() => router.push(`/admin/usuario/${d.autor.id}`)}
        />
      </View>

      {!!d.outrosDenunciantes && (
        <Aviso tipo="info">
          {d.outrosDenunciantes === 1
            ? 'Outra pessoa também denunciou este link.'
            : `Outras ${d.outrosDenunciantes} pessoas também denunciaram este link.`}
        </Aviso>
      )}

      <View style={cartao}>
        <Texto variante="rotulo">Link denunciado</Texto>
        <Texto selectable style={estilos.link}>
          {d.url}
        </Texto>
        <Texto variante="rotulo">Descrição</Texto>
        <Texto>{d.descricao}</Texto>
      </View>

      <View style={cartao}>
        <View style={estilos.linha}>
          <Texto variante="rotulo">Score de credibilidade</Texto>
          <Texto variante="destaque" cor={corDoScore(d.score)}>
            {d.score}/100
          </Texto>
        </View>
        <BarraProgresso valor={d.score / 100} cor={corDoScore(d.score)} />
        <Texto variante="rotulo">Evidências ({d.evidencias?.length ?? 0})</Texto>
        {d.sensivel && !!d.evidencias?.length && (
          <Texto variante="legenda">
            Conteúdo sensível: as imagens ficam borradas até você escolher ver.
          </Texto>
        )}
        {d.evidencias?.length ? (
          <View style={estilos.grade}>
            {d.evidencias.map((caminho, i) => (
              <FotoEvidencia
                key={caminho}
                uri={urlArquivo(caminho)}
                sensivel={d.sensivel}
                rotulo={`Evidência ${i + 1}`}
                style={[estilos.miniatura, { backgroundColor: colors.cardAlt }]}
              />
            ))}
          </View>
        ) : (
          <Texto variante="legenda">Sem imagens anexadas.</Texto>
        )}
      </View>

      {!!d.historico?.length && (
        <View style={cartao}>
          <Texto variante="rotulo">Andamento</Texto>
          <LinhaDoTempo passos={d.historico} />
        </View>
      )}

      {!!resultado && <Aviso tipo="sucesso">{resultado}</Aviso>}
      {!!erro && <Aviso tipo="erro">{erro}</Aviso>}

      {aberta && (
        <View style={cartao}>
          <Texto variante="subtitulo">Decisão da moderação</Texto>
          <Campo
            rotulo="Observação (opcional)"
            value={nota}
            onChangeText={setNota}
            placeholder="Ex.: perfil removido pela plataforma"
            maxLength={300}
          />
          {pedindoMotivo && (
            <View style={estilos.motivo}>
              <Texto variante="rotulo">Motivo da rejeição</Texto>
              <Chips
                opcoes={(Object.keys(MOTIVOS) as MotivoRejeicao[]).map((m) => ({
                  valor: m,
                  rotulo: MOTIVOS[m].rotulo,
                }))}
                valor={motivo}
                onChange={(m) => {
                  setMotivo(m as MotivoRejeicao);
                  setErro('');
                }}
              />
              <Texto variante="legenda">
                O autor vê o motivo e a sua observação. Escreva em linguagem simples.
              </Texto>
            </View>
          )}
          {d.status === 'PENDENTE' && (
            <Botao
              titulo="Iniciar análise"
              icone="search"
              variante="secundario"
              onPress={() => decidir('EM_ANALISE')}
              desabilitado={mudar.isPending}
            />
          )}
          <View style={estilos.botoes}>
            <View style={estilos.flex}>
              <Botao
                titulo={pedindoMotivo ? 'Rejeitar com motivo' : 'Rejeitar'}
                icone="x"
                variante="perigo"
                onPress={() => decidir('REJEITADA')}
                desabilitado={mudar.isPending}
              />
            </View>
            <View style={estilos.flex}>
              <Botao
                titulo="Confirmar"
                icone="check"
                onPress={() => decidir('CONFIRMADA')}
                carregando={mudar.isPending}
              />
            </View>
          </View>
          {embutida && Platform.OS === 'web' && (
            <Texto variante="legenda">
              Atalhos: C confirma, R rejeita, J próxima, K anterior. Depois de decidir, a próxima
              abre sozinha.
            </Texto>
          )}
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.sm },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.md,
  },
  valor: { flexShrink: 1, textAlign: 'right' },
  link: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13, marginBottom: espaco.sm },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  miniatura: { width: 88, height: 88, borderRadius: raio.md },
  botoes: { flexDirection: 'row', gap: espaco.sm },
  motivo: { gap: espaco.sm },
});
