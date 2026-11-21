import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import Aviso from '@/components/Aviso';
import BarraProgresso from '@/components/BarraProgresso';
import Cabecalho from '@/components/Cabecalho';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import LinhaDoTempo from '@/components/LinhaDoTempo';
import StatusBadge from '@/components/StatusBadge';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { urlArquivo } from '@/services/api';
import { useDenuncia } from '@/services/denuncias';
import { espaco, raio } from '@/theme';
import { corDoScore, formatarData } from '@/utils';

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
      </View>

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
        <View style={estilos.linha}>
          <Texto variante="rotulo">Score de credibilidade</Texto>
          <Texto variante="destaque" cor={corDoScore(d.score)}>
            {d.score}/100
          </Texto>
        </View>
        <BarraProgresso valor={d.score / 100} cor={corDoScore(d.score)} />
      </View>

      <View style={cartao}>
        <Texto variante="rotulo">Evidências ({d.evidencias?.length ?? 0})</Texto>
        {d.evidencias?.length ? (
          <View style={estilos.grade}>
            {d.evidencias.map((caminho) => (
              <Pressable
                key={caminho}
                onPress={() => setAmpliada(urlArquivo(caminho))}
                accessibilityRole="imagebutton"
                accessibilityLabel="Ampliar evidência">
                <Image
                  source={{ uri: urlArquivo(caminho) }}
                  style={[estilos.miniatura, { backgroundColor: colors.cardAlt }]}
                  contentFit="cover"
                  transition={200}
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <Texto variante="legenda">Nenhuma imagem foi anexada.</Texto>
        )}
      </View>

      {d.status === 'REJEITADA' && (
        <Aviso tipo="alerta">
          A moderação não encontrou violação nesta denúncia. Revise as regras antes de denunciar de
          novo.
        </Aviso>
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
  fundoModal: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.lg },
  ampliada: { width: '100%', height: '80%' },
  fechar: { position: 'absolute', top: espaco.xxl, right: espaco.xl },
});
