import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import BarraProgresso from '@/components/BarraProgresso';
import CartaoDenunciaAdmin from '@/components/CartaoDenunciaAdmin';
import Chips from '@/components/Chips';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import Seletor from '@/components/Seletor';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { PRIORIDADE } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { usePreviaExportacao, type FiltrosExportacao } from '@/services/admin';
import { espaco, raio } from '@/theme';

const PERIODOS = [
  { valor: '7', rotulo: '7 dias' },
  { valor: '30', rotulo: '30 dias' },
  { valor: '90', rotulo: '90 dias' },
  { valor: 'tudo', rotulo: 'Tudo' },
];

const ARQUIVOS = [
  {
    nome: 'denuncias.csv',
    texto:
      'Uma linha por denúncia, separada por ponto e vírgula (abre direto no Excel): prioridade, protocolo, data, status, plataforma, categoria, link, resumo, score e nível de confiança do autor.',
  },
  {
    nome: 'LEIA-ME.txt',
    texto: 'Resumo com o período, os totais por prioridade e status e como ler o arquivo.',
  },
];

export default function ExportarScreen() {
  const { colors } = useTheme();
  const [periodo, setPeriodo] = useState('30');
  const [rejeitadas, setRejeitadas] = useState<'nao' | 'sim'>('nao');

  const filtros: FiltrosExportacao = {
    dias: periodo === 'tudo' ? undefined : Number(periodo),
    incluirRejeitadas: rejeitadas === 'sim',
  };
  const previa = usePreviaExportacao(filtros);
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <Tela semFundoSeguro>
      <View>
        <Texto variante="titulo">Exportação</Texto>
        <Texto cor="textMuted">
          Arquivo leve e compactado (.zip) para enviar ao órgão regulador, com as denúncias de quem
          tem mais confiança primeiro.
        </Texto>
      </View>

      <View style={cartao}>
        <Texto variante="rotulo">Período</Texto>
        <Chips opcoes={PERIODOS} valor={periodo} onChange={setPeriodo} />
        <Texto variante="rotulo">Denúncias rejeitadas</Texto>
        <Seletor
          opcoes={[
            { valor: 'nao', rotulo: 'Deixar de fora' },
            { valor: 'sim', rotulo: 'Incluir' },
          ]}
          valor={rejeitadas}
          onChange={setRejeitadas}
        />
      </View>

      {previa.isPending ? (
        <Carregando />
      ) : previa.isError ? (
        <EstadoVazio
          icone="wifi-off"
          titulo="Não deu para montar a prévia"
          texto={previa.error.message}
          acao={{ titulo: 'Tentar de novo', onPress: () => previa.refetch() }}
        />
      ) : (
        <>
          <View style={cartao}>
            <View style={estilos.linha}>
              <Texto variante="subtitulo">Prévia</Texto>
              <Texto variante="numero" cor="primary">
                {previa.data.total}
              </Texto>
            </View>
            <Texto variante="legenda">
              {previa.data.total === 1 ? 'denúncia vai' : 'denúncias vão'} para o arquivo.
            </Texto>
            {(['ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => (
              <View key={p} style={estilos.prioridade}>
                <View style={estilos.linha}>
                  <Texto variante="destaque">Prioridade {PRIORIDADE[p].rotulo}</Texto>
                  <Texto variante="destaque">{previa.data.porPrioridade[p]}</Texto>
                </View>
                <BarraProgresso
                  valor={previa.data.total ? previa.data.porPrioridade[p] / previa.data.total : 0}
                  cor={PRIORIDADE[p].cor}
                  altura={6}
                />
              </View>
            ))}
          </View>

          {previa.data.primeiras.length > 0 && (
            <View style={estilos.lista}>
              <Texto variante="rotulo">Primeiras da lista</Texto>
              {previa.data.primeiras.map((d) => (
                <CartaoDenunciaAdmin key={d.id} denuncia={d} />
              ))}
            </View>
          )}
        </>
      )}

      <View style={cartao}>
        <Texto variante="rotulo">O que vai no .zip</Texto>
        {ARQUIVOS.map((a) => (
          <View key={a.nome} style={estilos.arquivo}>
            <Feather name="file-text" size={18} color={colors.primary} />
            <View style={estilos.flex}>
              <Texto variante="destaque">{a.nome}</Texto>
              <Texto variante="legenda">{a.texto}</Texto>
            </View>
          </View>
        ))}
        <View style={estilos.arquivo}>
          <Feather name="lock" size={18} color={colors.success} />
          <Texto variante="legenda" style={estilos.flex}>
            O nome e o e-mail de quem denunciou não vão no arquivo: cada autor aparece só como um
            código (ex.: U0004).
          </Texto>
        </View>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prioridade: { gap: espaco.xs },
  lista: { gap: espaco.sm },
  arquivo: { flexDirection: 'row', gap: espaco.md },
});
