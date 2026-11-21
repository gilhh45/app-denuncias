import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import BarraProgresso from '@/components/BarraProgresso';
import Cabecalho from '@/components/Cabecalho';
import CartaoConfianca from '@/components/CartaoConfianca';
import { SeloPrioridade } from '@/components/CartaoDenunciaAdmin';
import DenunciaCard from '@/components/DenunciaCard';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { iniciais } from '@/screens/admin/UsuariosScreen';
import { useAnaliseUsuario } from '@/services/admin';
import { espaco, fontes, raio, type Cores } from '@/theme';
import { formatarData, resumoDenuncia } from '@/utils';

function Numero({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: keyof Cores }) {
  return (
    <View style={estilos.numero}>
      <Texto variante="numero" cor={cor}>
        {valor}
      </Texto>
      <Texto variante="legenda" centro>
        {rotulo}
      </Texto>
    </View>
  );
}

export default function AnaliseUsuarioScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const analise = useAnaliseUsuario(Number(id));

  if (analise.isPending) {
    return (
      <Tela>
        <Cabecalho voltar titulo="Usuário" />
        <Carregando />
      </Tela>
    );
  }
  if (analise.isError) {
    return (
      <Tela>
        <Cabecalho voltar titulo="Usuário" />
        <EstadoVazio icone="user-x" titulo="Usuário não encontrado" texto={analise.error.message} />
      </Tela>
    );
  }

  const { usuario: u, estatisticas: e, categorias, denuncias, prioridade } = analise.data;
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];
  const maiorCategoria = Math.max(1, ...categorias.map((c) => c.total));

  return (
    <Tela>
      <Cabecalho voltar titulo="Análise do usuário" />

      <View style={[cartao, estilos.topo]}>
        <View style={[estilos.avatar, { backgroundColor: colors.primarySoft }]}>
          <Texto style={[estilos.iniciais, { color: colors.primary }]}>{iniciais(u.nome)}</Texto>
        </View>
        <View style={estilos.flex}>
          <Texto variante="subtitulo">{u.nome}</Texto>
          <Texto variante="legenda">{u.email}</Texto>
          <Texto variante="legenda">
            Cadastro: {formatarData(u.criadoEm, false)}
            {u.ultimoAcesso ? ` · último acesso ${formatarData(u.ultimoAcesso)}` : ''}
          </Texto>
          <View style={estilos.selo}>
            <SeloPrioridade prioridade={prioridade} />
          </View>
        </View>
      </View>

      <CartaoConfianca usuario={u} estatisticas={e} />

      <View style={[cartao, estilos.numeros]}>
        <Numero valor={e.total} rotulo="Enviadas" cor="text" />
        <Numero valor={e.pendentes + e.emAnalise} rotulo="Abertas" cor="info" />
        <Numero valor={e.confirmadas} rotulo="Confirmadas" cor="success" />
        <Numero valor={e.rejeitadas} rotulo="Rejeitadas" cor="danger" />
      </View>

      {categorias.length > 0 && (
        <View style={cartao}>
          <Texto variante="rotulo">O que mais denuncia</Texto>
          {categorias.map((c) => (
            <View key={c.categoria} style={estilos.categoria}>
              <View style={estilos.linha}>
                <Texto style={estilos.flex}>{c.categoria}</Texto>
                <Texto variante="destaque">{c.total}</Texto>
              </View>
              <BarraProgresso valor={c.total / maiorCategoria} cor="info" altura={6} />
            </View>
          ))}
          <Texto variante="legenda">Score médio das denúncias: {e.scoreMedio}/100</Texto>
        </View>
      )}

      <Texto variante="subtitulo">Denúncias ({denuncias.length})</Texto>
      {denuncias.length === 0 ? (
        <EstadoVazio icone="inbox" titulo="Nenhuma denúncia enviada" />
      ) : (
        denuncias.map((d) => (
          <DenunciaCard
            key={d.id}
            titulo={d.titulo}
            detalhe={`${d.protocolo} · ${resumoDenuncia(d)}`}
            data={formatarData(d.criadaEm)}
            status={d.status}
            icone={d.tipo === 'SITE' ? 'globe' : 'users'}
            onPress={() => router.push(`/admin/denuncia/${d.id}`)}
          />
        ))
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.sm },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: { fontFamily: fontes.negrito, fontSize: 18 },
  selo: { flexDirection: 'row', marginTop: espaco.xs },
  numeros: { flexDirection: 'row' },
  numero: { flex: 1, alignItems: 'center', gap: 2 },
  categoria: { gap: espaco.xs },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
});
