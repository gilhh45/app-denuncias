import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import Botao from '@/components/Botao';
import Cabecalho from '@/components/Cabecalho';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import FotoEvidencia from '@/components/FotoEvidencia';
import LinhaDoTempo from '@/components/LinhaDoTempo';
import StatusBadge from '@/components/StatusBadge';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { FORCA, MOTIVOS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { urlArquivo } from '@/services/api';
import { useDenuncia } from '@/services/denuncias';
import { espaco, raio } from '@/theme';
import { formatarData } from '@/utils';

const DICAS_PROXIMA = [
  'Marque o minuto do vídeo ou o trecho em que aparece o problema.',
  'Anexe um print da publicação ou da conversa.',
  'Diga qual é a informação correta ou o que foi prometido.',
];

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

export default function DetalheDenunciaScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const denuncia = useDenuncia(Number(id));
  const [ampliada, setAmpliada] = useState<string | null>(null);

  if (denuncia.isPending) {
    return (
      <Tela>
        <Cabecalho voltar titulo="Denúncia" />
        <Carregando />
      </Tela>
    );
  }

  if (denuncia.isError) {
    return (
      <Tela>
        <Cabecalho voltar titulo="Denúncia" />
        <EstadoVazio
          icone="alert-circle"
          titulo="Não encontramos esta denúncia"
          texto={denuncia.error.message}
          acao={{ titulo: 'Tentar de novo', onPress: () => denuncia.refetch() }}
        />
      </Tela>
    );
  }

  const d = denuncia.data;
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <Tela>
      <Cabecalho voltar titulo="Denúncia" subtitulo={`Protocolo ${d.protocolo}`} />

      <View style={cartao}>
        <View style={estilos.linha}>
          <StatusBadge status={d.status} />
          <Texto variante="legenda">{formatarData(d.criadaEm)}</Texto>
        </View>
        <Texto variante="subtitulo">{d.titulo}</Texto>
        <View style={[estilos.divisor, { backgroundColor: colors.divider }]} />
        <Linha rotulo="Onde" valor={d.tipo === 'SITE' ? 'Site' : (d.plataforma ?? 'Rede social')} />
        {!!d.perfil && <Linha rotulo="Perfil" valor={d.perfil} />}
        <Linha rotulo="Categoria" valor={d.categoria} />
        <Linha rotulo="Força" valor={FORCA[d.forca].rotulo} />
      </View>

      {d.status === 'REJEITADA' && d.decisao && (
        <View
          style={[
            estilos.cartao,
            { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
          ]}>
          <View style={estilos.topoDecisao}>
            <Feather name="x-circle" size={20} color={colors.danger} />
            <Texto variante="subtitulo">Denúncia rejeitada</Texto>
          </View>
          <Texto variante="rotulo">Motivo</Texto>
          <Texto variante="destaque">
            {d.decisao.motivo ? MOTIVOS[d.decisao.motivo].rotulo : 'Sem motivo informado'}
          </Texto>
          {d.decisao.motivo && <Texto>{MOTIVOS[d.decisao.motivo].explicacao}</Texto>}
          {!!d.decisao.nota && (
            <View style={[estilos.nota, { backgroundColor: colors.card }]}>
              <Texto>“{d.decisao.nota}”</Texto>
              <Texto variante="rotulo">Nota da moderação · {formatarData(d.decisao.em)}</Texto>
            </View>
          )}
          <Texto variante="legenda">
            Isso conta para o seu nível, mas rejeições não bloqueiam sua conta.
          </Texto>
        </View>
      )}

      {!!d.historico?.length && (
        <View style={cartao}>
          <Texto variante="rotulo">Andamento</Texto>
          <LinhaDoTempo passos={d.historico} />
        </View>
      )}

      <View style={cartao}>
        <Texto variante="rotulo">Link denunciado</Texto>
        <Texto variante="corpo" selectable style={estilos.link}>
          {d.url}
        </Texto>
        <Texto variante="legenda">
          Por segurança, evite abrir links suspeitos. Copie só se precisar.
        </Texto>
      </View>

      <View style={cartao}>
        <Texto variante="rotulo">Descrição</Texto>
        <Texto>{d.descricao}</Texto>
      </View>

      <View style={cartao}>
        <Texto variante="rotulo">Evidências ({d.evidencias?.length ?? 0})</Texto>
        {d.evidencias?.length ? (
          <View style={estilos.grade}>
            {d.evidencias.map((caminho, i) => (
              <FotoEvidencia
                key={caminho}
                uri={urlArquivo(caminho)}
                sensivel={d.sensivel}
                rotulo={`Ampliar evidência ${i + 1}`}
                onPress={() => setAmpliada(urlArquivo(caminho))}
                style={[estilos.miniatura, { backgroundColor: colors.cardAlt }]}
              />
            ))}
          </View>
        ) : (
          <Texto variante="legenda">
            Nenhuma imagem foi anexada. Prints deixam a denúncia mais forte.
          </Texto>
        )}
      </View>

      {d.status === 'REJEITADA' && (
        <View style={cartao}>
          <Texto variante="subtitulo">Para a próxima denúncia</Texto>
          {DICAS_PROXIMA.map((dica) => (
            <View key={dica} style={estilos.dica}>
              <Feather name="check" size={18} color={colors.success} />
              <Texto style={estilos.flex}>{dica}</Texto>
            </View>
          ))}
          <Botao
            titulo="Fazer nova denúncia"
            icone="arrow-right"
            onPress={() => router.push('/nova-denuncia')}
          />
        </View>
      )}

      <Modal
        visible={!!ampliada}
        transparent
        animationType="fade"
        onRequestClose={() => setAmpliada(null)}>
        <Pressable
          style={[estilos.fundoModal, { backgroundColor: colors.overlay }]}
          onPress={() => setAmpliada(null)}
          accessibilityLabel="Fechar imagem">
          {ampliada && (
            <Image source={{ uri: ampliada }} style={estilos.ampliada} contentFit="contain" />
          )}
          <View style={estilos.fechar}>
            <Feather name="x" size={24} color="#ffffff" />
          </View>
        </Pressable>
      </Modal>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.sm },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaco.md,
  },
  valor: { flexShrink: 1, textAlign: 'right' },
  divisor: { height: 1, marginVertical: espaco.xs },
  link: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  miniatura: { width: 96, height: 96, borderRadius: raio.md },
  topoDecisao: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  nota: { borderRadius: raio.md, padding: espaco.md, gap: espaco.sm },
  dica: { flexDirection: 'row', gap: espaco.md, alignItems: 'flex-start' },
  flex: { flex: 1 },
  fundoModal: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.lg },
  ampliada: { width: '100%', height: '80%' },
  fechar: { position: 'absolute', top: espaco.xxl, right: espaco.xl },
});
