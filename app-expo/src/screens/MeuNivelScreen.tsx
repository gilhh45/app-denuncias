import { StyleSheet, View } from 'react-native';

import Cabecalho from '@/components/Cabecalho';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { useDetalheNivel } from '@/services/conta';
import { espaco, raio } from '@/theme';
import { formatarData } from '@/utils';

/**
 * "Como meu nível é calculado": o único lugar em que o cidadão vê os próprios pontos.
 * Fica fora das telas do dia a dia para ninguém denunciar pensando em pontos (LGPD: direito de acesso).
 */
export default function MeuNivelScreen() {
  const { colors } = useTheme();
  const nivel = useDetalheNivel();
  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];

  if (nivel.isPending) {
    return (
      <Tela>
        <Cabecalho voltar titulo="Meu nível" />
        <Carregando />
      </Tela>
    );
  }
  if (nivel.isError) {
    return (
      <Tela>
        <Cabecalho voltar titulo="Meu nível" />
        <EstadoVazio
          icone="wifi-off"
          titulo="Não deu para carregar"
          texto={nivel.error.message}
          acao={{ titulo: 'Tentar de novo', onPress: () => nivel.refetch() }}
        />
      </Tela>
    );
  }

  const n = nivel.data;
  return (
    <Tela>
      <Cabecalho
        voltar
        titulo="Como meu nível é calculado"
        subtitulo="Estes são os dados que definem o seu nível."
      />

      <View style={cartao}>
        <View style={estilos.linha}>
          <View style={estilos.flex}>
            <Texto variante="rotulo">Seus pontos</Texto>
            <Texto variante="numero">{n.pontos}</Texto>
          </View>
          <Texto variante="destaque">Nível {n.nivel}</Texto>
        </View>
        {n.niveis.map((item) => {
          const atual = item.nome === n.nivel;
          return (
            <View
              key={item.nome}
              style={[
                estilos.linha,
                estilos.nivel,
                { borderTopColor: colors.divider },
                atual && { backgroundColor: colors.primarySoft },
              ]}>
              <Texto variante={atual ? 'destaque' : 'corpo'} style={estilos.flex}>
                {item.nome}
              </Texto>
              <Texto variante="legenda">{item.minimo}+ pontos</Texto>
              <Texto variante="legenda" style={estilos.bonus}>
                {item.bonusScore ? `+${item.bonusScore} no score` : 'sem bônus'}
              </Texto>
            </View>
          );
        })}
      </View>

      <View style={cartao}>
        <Texto variante="subtitulo">Regras</Texto>
        <Texto>• Denúncia confirmada: {n.regras.confirmada}.</Texto>
        <Texto>• Denúncia rejeitada: {n.regras.rejeitada} pontos.</Texto>
        <Texto>
          • O score de cada denúncia vai de 0 a 100: conta ter cadastro, link com https, descrição
          detalhada, prints e o bônus do seu nível.
        </Texto>
        <Texto>• O nível define a prioridade das suas denúncias na fila da moderação.</Texto>
      </View>

      <View style={cartao}>
        <Texto variante="subtitulo">Últimas mudanças</Texto>
        {n.mudancas.length === 0 ? (
          <Texto variante="legenda">Nenhuma denúncia sua foi decidida ainda.</Texto>
        ) : (
          n.mudancas.map((m) => (
            <View key={`${m.protocolo}-${m.em}`} style={estilos.linha}>
              <View style={estilos.flex}>
                <Texto variante="destaque" numberOfLines={1}>
                  {m.titulo}
                </Texto>
                <Texto variante="legenda">
                  {m.protocolo} · {formatarData(m.em)}
                </Texto>
              </View>
              <Texto variante="destaque" cor={m.variacaoPontos > 0 ? 'success' : 'danger'}>
                {m.variacaoPontos > 0 ? `+${m.variacaoPontos}` : `−${-m.variacaoPontos}`}
              </Texto>
            </View>
          ))
        )}
      </View>

      <Texto variante="legenda">
        Discorda de alguma decisão? Pela LGPD você pode pedir a revisão pelo contato indicado na
        política de privacidade.
      </Texto>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  nivel: {
    borderTopWidth: 1,
    paddingTop: espaco.md,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.sm,
  },
  bonus: { minWidth: 90, textAlign: 'right' },
});
