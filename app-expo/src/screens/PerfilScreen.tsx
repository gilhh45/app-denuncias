import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Botao from '@/components/Botao';
import CartaoConfianca from '@/components/CartaoConfianca';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio, type Cores } from '@/theme';

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
}

function Estatistica({
  valor,
  rotulo,
  cor = 'text',
}: {
  valor: string;
  rotulo: string;
  cor?: keyof Cores;
}) {
  return (
    <View style={estilos.estatistica}>
      <Texto variante="numero" cor={cor}>
        {valor}
      </Texto>
      <Texto variante="legenda" centro>
        {rotulo}
      </Texto>
    </View>
  );
}

export default function PerfilScreen() {
  const { colors } = useTheme();
  const { usuario, estatisticas, sair } = useAuth();

  if (!usuario) return null;

  const desde = new Date(usuario.criadoEm).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <Tela semFundoSeguro>
      <Texto variante="titulo">Perfil</Texto>

      <View style={[cartao, estilos.usuario]}>
        <View style={[estilos.avatar, { backgroundColor: colors.primary }]}>
          <Texto variante="subtitulo" cor="onPrimary">
            {iniciais(usuario.nome)}
          </Texto>
        </View>
        <View style={estilos.flex}>
          <Texto variante="subtitulo">{usuario.nome}</Texto>
          <Texto variante="legenda">{usuario.email}</Texto>
          <Texto variante="legenda">Membro desde {desde}</Texto>
        </View>
      </View>

      <CartaoConfianca usuario={usuario} />

      {estatisticas && (
        <View style={[cartao, estilos.grade]}>
          <Estatistica valor={String(estatisticas.total)} rotulo="Enviadas" />
          <Estatistica
            valor={String(estatisticas.confirmadas)}
            rotulo="Confirmadas"
            cor="success"
          />
          <Estatistica valor={String(estatisticas.rejeitadas)} rotulo="Rejeitadas" cor="danger" />
          <Estatistica
            valor={estatisticas.taxaAcerto === null ? '—' : `${estatisticas.taxaAcerto}%`}
            rotulo="Acerto"
            cor="info"
          />
        </View>
      )}

      <View style={estilos.privacidade}>
        <Feather name="lock" size={14} color={colors.textMuted} />
        <Texto variante="legenda" style={estilos.flex}>
          Seu nome e e-mail não vão para o órgão regulador: na exportação aparece só um código.
        </Texto>
      </View>

      <Botao titulo="Sair da conta" icone="log-out" variante="perigo" onPress={sair} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg },
  usuario: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grade: { flexDirection: 'row', justifyContent: 'space-between' },
  estatistica: { flex: 1, alignItems: 'center', gap: 2 },
  privacidade: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
});
