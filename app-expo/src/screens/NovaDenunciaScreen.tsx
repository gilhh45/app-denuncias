import { router, usePreventRemove } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import CaixaCaptcha from '@/components/CaixaCaptcha';
import Cabecalho from '@/components/Cabecalho';
import Campo from '@/components/Campo';
import Chips from '@/components/Chips';
import Evidencias, { type Imagem } from '@/components/Evidencias';
import PreviaScore from '@/components/PreviaScore';
import Seletor from '@/components/Seletor';
import SeletorCategoria from '@/components/SeletorCategoria';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { PLATAFORMAS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useContagem } from '@/hooks/useContagem';
import { ErroApi } from '@/services/api';
import { useCaptcha, useCriarDenuncia, useLimite } from '@/services/denuncias';
import { espaco } from '@/theme';
import type { DenunciaCriada } from '@/types';
import { confirmar, formatarEspera, previaScore, urlValida } from '@/utils';

type Tipo = 'SITE' | 'REDE_SOCIAL';
type Erros = Partial<
  Record<'plataforma' | 'url' | 'categoria' | 'titulo' | 'descricao' | 'captcha' | 'geral', string>
>;

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
  const { usuario } = useAuth();
  const limite = useLimite();
  const espera = useContagem(
    limite.data?.esperarSegundos ?? 0,
    limite.refetch,
    limite.dataUpdatedAt,
  );
  const bloqueado = espera > 0;
  const captcha = useCaptcha();
  const criar = useCriarDenuncia();
  const [tipo, setTipo] = useState<Tipo>('SITE');
  const [plataforma, setPlataforma] = useState<string | null>(null);
  const [perfil, setPerfil] = useState('');
  const [url, setUrl] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [resposta, setResposta] = useState('');
  const [erros, setErros] = useState<Erros>({});

  const previa = useMemo(
    () =>
      previaScore(
        url,
        descricao,
        imagens.length,
        usuario?.nivel.bonus ?? 0,
        usuario?.nivel.nome ?? '',
      ),
    [url, descricao, imagens.length, usuario],
  );

  function validar() {
    const e: Erros = {};
    if (tipo === 'REDE_SOCIAL' && !plataforma) e.plataforma = 'Escolha a rede social.';
    if (!urlValida(url)) e.url = 'Cole o link completo, começando com http:// ou https://';
    if (!categoria) e.categoria = 'Escolha a categoria.';
    if (titulo.trim().length < 5) e.titulo = 'Escreva um título com pelo menos 5 letras.';
    if (descricao.trim().length < 20) e.descricao = 'Conte o que aconteceu (mínimo de 20 letras).';
    if (!resposta) e.captcha = 'Responda a conta.';
    return e;
  }

  // se a pessoa já preencheu algo, pergunta antes de sair e perder tudo
  const [saindo, setSaindo] = useState(false);
  const preenchido = !!(url || titulo || descricao || perfil || imagens.length);
  usePreventRemove(preenchido && !saindo, async ({ repeat }) => {
    const sair = await confirmar(
      'Descartar denúncia?',
      'O que você preencheu vai ser perdido.',
      'Descartar',
    );
    if (sair) {
      setSaindo(true);
      repeat();
    }
  });

  // navega só depois que a trava de saída foi desligada
  const [criada, setCriada] = useState<DenunciaCriada | null>(null);
  useEffect(() => {
    if (!criada) return;
    router.replace({
      pathname: '/sucesso',
      params: {
        id: criada.denuncia.id,
        protocolo: criada.denuncia.protocolo,
        score: criada.score.valor,
        pontos: criada.pontosSeConfirmada,
      },
    });
  }, [criada]);

  function trocarCaptcha() {
    setResposta('');
    captcha.refetch();
  }

  function enviar() {
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length || !captcha.data) {
      if (Object.keys(encontrados).length) {
        setErros((e) => ({ ...e, geral: 'Confira os campos marcados acima.' }));
      }
      return;
    }

    criar.mutate(
      {
        tipo,
        plataforma: tipo === 'REDE_SOCIAL' ? (plataforma ?? undefined) : undefined,
        perfil: tipo === 'REDE_SOCIAL' ? perfil.trim() : undefined,
        categoria: categoria!,
        titulo: titulo.trim(),
        url: url.trim(),
        descricao: descricao.trim(),
        captchaId: captcha.data.id,
        captchaResposta: resposta,
        imagens,
      },
      {
        onSuccess: (r) => {
          setSaindo(true);
          setCriada(r);
        },
        onError: (erro) => {
          setResposta('');
          if (!(erro instanceof ErroApi)) {
            setErros({ geral: 'Não foi possível enviar agora. Tente de novo.' });
          } else if (erro.campo === 'url' || erro.campo === 'captcha') {
            setErros({ [erro.campo]: erro.message });
          } else {
            setErros({ geral: erro.message });
          }
        },
      },
    );
  }

  return (
    <Tela>
      <Cabecalho
        voltar
        titulo="Nova denúncia"
        subtitulo="Quanto mais detalhes, mais rápido a moderação consegue analisar."
      />

      {bloqueado ? (
        <Aviso tipo="alerta">
          <Texto variante="destaque" cor="warning">
            {limite.data?.motivo}
          </Texto>
          <Texto variante="legenda" cor="warning">
            Para evitar spam, você poderá enviar de novo em {formatarEspera(espera)}.
          </Texto>
        </Aviso>
      ) : (
        limite.data && (
          <Texto variante="legenda">
            Você ainda pode enviar {limite.data.restantesNaHora} de {limite.data.limitePorHora}{' '}
            denúncias nesta hora.
          </Texto>
        )
      )}

      <Secao titulo="Onde está o problema?">
        <Seletor
          opcoes={[
            { valor: 'SITE', rotulo: 'Site', icone: 'globe' },
            { valor: 'REDE_SOCIAL', rotulo: 'Rede social', icone: 'users' },
          ]}
          valor={tipo}
          onChange={setTipo}
        />
        {tipo === 'REDE_SOCIAL' && (
          <>
            <Chips
              opcoes={PLATAFORMAS}
              valor={plataforma}
              onChange={(p) => {
                setPlataforma(p);
                setErros((e) => ({ ...e, plataforma: undefined }));
              }}
              sangrar
            />
            {!!erros.plataforma && (
              <Texto variante="legenda" cor="danger">
                {erros.plataforma}
              </Texto>
            )}
            <Campo
              rotulo="Perfil denunciado (opcional)"
              icone="at-sign"
              value={perfil}
              onChangeText={setPerfil}
              placeholder="@usuario ou nome da página"
              autoCapitalize="none"
              maxLength={80}
            />
          </>
        )}
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
        <SeletorCategoria
          valor={categoria}
          onChange={(c) => {
            setCategoria(c);
            setErros((e) => ({ ...e, categoria: undefined }));
          }}
          erro={erros.categoria}
        />
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

      <Secao titulo="Provas">
        <Evidencias imagens={imagens} onChange={setImagens} />
      </Secao>

      <PreviaScore previa={previa} />

      <CaixaCaptcha
        pergunta={captcha.data?.pergunta}
        carregando={captcha.isFetching}
        resposta={resposta}
        onResposta={(r) => {
          setResposta(r);
          setErros((e) => ({ ...e, captcha: undefined }));
        }}
        onTrocar={trocarCaptcha}
        erro={erros.captcha}
      />

      {!!erros.geral && <Aviso tipo="erro">{erros.geral}</Aviso>}
      <Botao
        titulo={bloqueado ? `Aguarde ${formatarEspera(espera)}` : 'Enviar denúncia'}
        icone={bloqueado ? 'clock' : 'send'}
        onPress={enviar}
        carregando={criar.isPending}
        desabilitado={bloqueado}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  secao: { gap: espaco.md },
  descricao: { minHeight: 120 },
});
