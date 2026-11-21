import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import Botao from '@/components/Botao';
import CartaoConfianca from '@/components/CartaoConfianca';
import Seletor from '@/components/Seletor';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type Preferencia } from '@/context/ThemeContext';
import { espaco, raio, type Cores } from '@/theme';
import { confirmar } from '@/utils';

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
  const { colors, preferencia, definirPreferencia } = useTheme();
  const { usuario, estatisticas, sair } = useAuth();

  async function pedirParaSair() {
    if (await confirmar('Sair da conta?', 'Você vai precisar entrar de novo.', 'Sair')) sair();
  }

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

      <CartaoConfianca nivel={usuario.nivel} />
      <Pressable
        onPress={() => router.push('/meu-nivel')}
        accessibilityRole="button"
        style={({ pressed }) => [
          cartao,
          estilos.linkNivel,
          pressed && { backgroundColor: colors.cardAlt },
        ]}>
        <Feather name="award" size={20} color={colors.textMuted} />
        <View style={estilos.flex}>
          <Texto variante="destaque">Como meu nível é calculado</Texto>
          <Texto variante="legenda">Pontos, regras e histórico</Texto>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </Pressable>

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
            valor={String(estatisticas.pendentes + estatisticas.emAnalise)}
            rotulo="Em andamento"
            cor="info"
          />
        </View>
      )}

      <View style={[cartao, estilos.secao]}>
        <Texto variante="rotulo">Aparência</Texto>
        <Seletor<Preferencia>
          opcoes={[
            { valor: 'sistema', rotulo: 'Sistema', icone: 'smartphone' },
            { valor: 'claro', rotulo: 'Claro', icone: 'sun' },
            { valor: 'escuro', rotulo: 'Escuro', icone: 'moon' },
          ]}
          valor={preferencia}
          onChange={definirPreferencia}
        />
      </View>

      <View style={estilos.privacidade}>
        <Feather name="lock" size={14} color={colors.textMuted} />
        <Texto variante="legenda" style={estilos.flex}>
          Seu nome e e-mail não vão para o órgão regulador: na exportação aparece só um código.
        </Texto>
      </View>

      <Botao titulo="Sair da conta" icone="log-out" variante="perigo" onPress={pedirParaSair} />
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
  secao: { gap: espaco.md },
  estatistica: { flex: 1, alignItems: 'center', gap: 2 },
  privacidade: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  linkNivel: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
});
