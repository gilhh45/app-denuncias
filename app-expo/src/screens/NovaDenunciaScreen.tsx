import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import Cabecalho from '@/components/Cabecalho';
import Campo from '@/components/Campo';
import Seletor from '@/components/Seletor';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { espaco } from '@/theme';
import { urlValida } from '@/utils';

type Tipo = 'SITE' | 'REDE_SOCIAL';
type Erros = Partial<Record<'url' | 'titulo' | 'descricao' | 'geral', string>>;

const MAX_DESCRICAO = 2000;

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Texto variante="subtitulo">{titulo}</Texto>
      {children}
    </View>
  );
}

export default function NovaDenunciaScreen() {
  const [tipo, setTipo] = useState<Tipo>('SITE');
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState<Erros>({});

  function validar() {
    const e: Erros = {};
    if (!urlValida(url)) e.url = 'Cole o link completo, começando com http:// ou https://';
    if (titulo.trim().length < 5) e.titulo = 'Escreva um título com pelo menos 5 letras.';
    if (descricao.trim().length < 20) e.descricao = 'Conte o que aconteceu (mínimo de 20 letras).';
    return e;
  }

  function enviar() {
    const encontrados = validar();
    setErros(encontrados);
  }

  return (
    <Tela>
      <Cabecalho
        voltar
        titulo="Nova denúncia"
        subtitulo="Quanto mais detalhes, mais rápido a moderação consegue analisar."
      />

      <Secao titulo="Onde está o problema?">
        <Seletor
          opcoes={[
            { valor: 'SITE', rotulo: 'Site', icone: 'globe' },
            { valor: 'REDE_SOCIAL', rotulo: 'Rede social', icone: 'users' },
          ]}
          valor={tipo}
          onChange={setTipo}
        />
        <Campo
          rotulo="Link"
          icone="link"
          value={url}
          onChangeText={setUrl}
          placeholder={
            tipo === 'SITE' ? 'https://site-suspeito.com' : 'https://instagram.com/perfil'
          }
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          erro={erros.url}
        />
      </Secao>

      <Secao titulo="O que aconteceu?">
        <Campo
          rotulo="Título"
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ex.: Loja falsa pedindo Pix"
          maxLength={100}
          erro={erros.titulo}
        />
        <Campo
          rotulo="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Explique o que viu, quando aconteceu e por que é um problema."
          multiline
          maxLength={MAX_DESCRICAO}
          textAlignVertical="top"
          style={estilos.descricao}
          erro={erros.descricao}
          dica={`${descricao.length}/${MAX_DESCRICAO}`}
        />
      </Secao>

      {!!erros.geral && <Aviso tipo="erro">{erros.geral}</Aviso>}
      <Botao titulo="Enviar denúncia" icone="send" onPress={enviar} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  secao: { gap: espaco.md },
  descricao: { minHeight: 120 },
});
