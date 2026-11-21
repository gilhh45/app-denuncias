import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Aviso from '@/components/Aviso';
import Botao from '@/components/Botao';
import CaixaCaptcha from '@/components/CaixaCaptcha';
import Cabecalho from '@/components/Cabecalho';
import Campo from '@/components/Campo';
import Chips from '@/components/Chips';
import Evidencias, { type Imagem } from '@/components/Evidencias';
import Passos from '@/components/Passos';
import PreviaScore from '@/components/PreviaScore';
import Seletor from '@/components/Seletor';
import SeletorCategoria from '@/components/SeletorCategoria';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { CATEGORIA_CVV, PLATAFORMAS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useContagem } from '@/hooks/useContagem';
import { ErroApi } from '@/services/api';
import { rascunhos, useVerificarLink } from '@/services/conta';
import { useCaptcha, useCriarDenuncia, useLimite } from '@/services/denuncias';
import { espaco } from '@/theme';
import type { DenunciaCriada } from '@/types';
import { completarLink, formatarEspera, plataformaDoLink, previaForca, urlValida } from '@/utils';

type Tipo = 'SITE' | 'REDE_SOCIAL';
type Erros = Partial<
  Record<'plataforma' | 'url' | 'categoria' | 'titulo' | 'descricao' | 'captcha' | 'geral', string>
>;

const MAX_DESCRICAO = 2000;
const PASSOS = ['Local', 'Relato', 'Provas', 'Revisão'];

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
  const [passo, setPasso] = useState(0);
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
    () => previaForca(url, descricao, imagens.length),
    [url, descricao, imagens.length],
  );
  const link = useVerificarLink(url);

  // valida só os campos da etapa atual (ou de todas, ao enviar)
  function validar(ate: number) {
    const e: Erros = {};
    if (ate >= 0) {
      if (tipo === 'REDE_SOCIAL' && !plataforma) e.plataforma = 'Escolha a rede social.';
      if (!urlValida(url)) e.url = 'Cole o link completo, começando com http:// ou https://';
      else if (link.data?.jaDenunciei) e.url = 'Você já denunciou este link.';
    }
    if (ate >= 1) {
      if (!categoria) e.categoria = 'Escolha a categoria.';
      if (titulo.trim().length < 5) e.titulo = 'Escreva um título com pelo menos 5 letras.';
      if (descricao.trim().length < 20)
        e.descricao = 'Conte o que aconteceu (mínimo de 20 letras).';
    }
    if (ate >= 3 && !resposta) e.captcha = 'Responda a conta.';
    return e;
  }

  // o rascunho fica salvo no aparelho: sair da tela não perde nada e, ao voltar, continua dele
  const idUsuario = usuario?.id;
  const [carregouRascunho, setCarregouRascunho] = useState(false);
  const [doRascunho, setDoRascunho] = useState(false);
  const enviada = useRef(false);
  useEffect(() => {
    if (!idUsuario) return;
    rascunhos.ler(idUsuario).then((r) => {
      if (r) {
        setDoRascunho(true);
        setPasso(r.passo);
        setTipo(r.tipo);
        setPlataforma(r.plataforma);
        setPerfil(r.perfil);
        setUrl(r.url);
        setCategoria(r.categoria);
        setTitulo(r.titulo);
        setDescricao(r.descricao);
        setImagens(r.imagens);
      }
      setCarregouRascunho(true);
    });
  }, [idUsuario]);

  function comecarDoZero() {
    if (idUsuario) rascunhos.apagar(idUsuario);
    setDoRascunho(false);
    setPasso(0);
    setTipo('SITE');
    setPlataforma(null);
    setPerfil('');
    setUrl('');
    setCategoria(null);
    setTitulo('');
    setDescricao('');
    setImagens([]);
    setErros({});
  }

  const preenchido = !!(url || titulo || descricao || perfil || imagens.length);
  useEffect(() => {
    if (!idUsuario || !carregouRascunho || !preenchido || enviada.current) return;
    const espera = setTimeout(() => {
      rascunhos.salvar(idUsuario, {
        passo,
        tipo,
        plataforma,
        perfil,
        url,
        categoria,
        titulo,
        descricao,
        imagens,
      });
    }, 400);
    return () => clearTimeout(espera);
  }, [
    idUsuario,
    carregouRascunho,
    preenchido,
    passo,
    tipo,
    plataforma,
    perfil,
    url,
    categoria,
    titulo,
    descricao,
    imagens,
  ]);

  // navega só depois que a trava de saída foi desligada
  const [criada, setCriada] = useState<DenunciaCriada | null>(null);
  useEffect(() => {
    if (!criada) return;
    router.replace({
      pathname: '/sucesso',
      params: { id: criada.denuncia.id, protocolo: criada.denuncia.protocolo, forca: criada.forca },
    });
  }, [criada]);

  const [detectada, setDetectada] = useState<string | null>(null);

  function mudarLink(texto: string) {
    setUrl(texto);
    setErros((e) => ({ ...e, url: undefined }));
    // colou um link de rede social: já marca o tipo e a plataforma
    const rede = plataformaDoLink(completarLink(texto));
    if (rede && rede !== plataforma) {
      setTipo('REDE_SOCIAL');
      setPlataforma(rede);
      setDetectada(rede);
    }
  }

  function trocarCaptcha() {
    setResposta('');
    captcha.refetch();
  }

  function avancar() {
    const encontrados = validar(passo);
    setErros(encontrados);
    if (!Object.keys(encontrados).length) setPasso((p) => Math.min(3, p + 1));
  }

  function enviar() {
    const encontrados = validar(3);
    setErros(encontrados);
    if (Object.keys(encontrados).length || !captcha.data) {
      if (encontrados.url || encontrados.plataforma) setPasso(0);
      else if (encontrados.categoria || encontrados.titulo || encontrados.descricao) setPasso(1);
      if (Object.keys(encontrados).length) {
        setErros((e) => ({ ...e, geral: 'Confira os campos marcados.' }));
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
          enviada.current = true;
          if (idUsuario) rascunhos.apagar(idUsuario);
          setCriada(r);
        },
        onError: (erro) => {
          setResposta('');
          if (!(erro instanceof ErroApi)) {
            setErros({ geral: 'Não foi possível enviar agora. Tente de novo.' });
          } else if (erro.campo === 'url' || erro.campo === 'captcha') {
            if (erro.campo === 'url') setPasso(0);
            setErros({ [erro.campo]: erro.message });
          } else {
            setErros({ geral: erro.message });
          }
        },
      },
    );
  }

  const resumo = [
    {
      rotulo: 'Local',
      valor: tipo === 'SITE' ? url || 'Site' : `${plataforma ?? 'Rede social'} · ${perfil || url}`,
      passo: 0,
    },
    { rotulo: 'Relato', valor: `${categoria ?? 'Sem categoria'} · ${titulo}`, passo: 1 },
    {
      rotulo: 'Provas',
      valor: `${imagens.length} ${imagens.length === 1 ? 'imagem' : 'imagens'} · denúncia ${previa.forca === 'FORTE' ? 'forte' : previa.forca === 'MEDIA' ? 'média' : 'fraca'}`,
      passo: 2,
    },
  ];

  return (
    <Tela>
      <Cabecalho voltar titulo="Nova denúncia" subtitulo="O rascunho fica salvo neste aparelho." />
      <Passos passos={PASSOS} atual={passo} />
      {doRascunho && (
        <View style={estilos.resumo}>
          <Texto variante="legenda" style={estilos.flex}>
            Você continuou de um rascunho salvo.
          </Texto>
          <Pressable onPress={comecarDoZero} accessibilityRole="button" style={estilos.alterar}>
            <Texto variante="destaque" cor="primary">
              Começar do zero
            </Texto>
          </Pressable>
        </View>
      )}

      {bloqueado ? (
        <Aviso tipo="alerta">
          <Texto variante="destaque" cor="warning">
            {limite.data?.motivo}
          </Texto>
          <Texto variante="legenda" cor="warning">
            Novo envio liberado em {formatarEspera(espera)}. Pode continuar preenchendo: o rascunho
            fica salvo.
          </Texto>
        </Aviso>
      ) : (
        passo === 0 &&
        limite.data && (
          <Texto variante="legenda">
            Você ainda pode enviar {limite.data.restantesNaHora} de {limite.data.limitePorHora}{' '}
            denúncias nesta hora.
          </Texto>
        )
      )}

      {passo === 0 && (
        <Secao titulo="Onde você viu o conteúdo?">
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
            onChangeText={mudarLink}
            onBlur={() => setUrl((u) => completarLink(u))}
            placeholder={
              tipo === 'SITE' ? 'https://site-suspeito.com' : 'https://instagram.com/perfil'
            }
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            erro={
              erros.url ?? (link.data?.jaDenunciei ? 'Você já denunciou este link.' : undefined)
            }
            dica={detectada ? `Detectamos que o link é do ${detectada}.` : undefined}
          />
          {!!link.data?.outrosDenunciantes && !link.data.jaDenunciei && (
            <Aviso tipo="info">
              <Texto variante="destaque" cor="info">
                {link.data.outrosDenunciantes === 1
                  ? 'Outra pessoa já denunciou este link'
                  : `${link.data.outrosDenunciantes} pessoas já denunciaram este link`}
              </Texto>
              <Texto variante="legenda">
                Vale a pena continuar: a sua denúncia soma provas ao mesmo caso e ajuda a moderação
                a decidir mais rápido.
              </Texto>
            </Aviso>
          )}
        </Secao>
      )}

      {passo === 1 && (
        <Secao titulo="O que aconteceu?">
          <SeletorCategoria
            valor={categoria}
            onChange={(c) => {
              setCategoria(c);
              setErros((e) => ({ ...e, categoria: undefined }));
            }}
            erro={erros.categoria}
          />
          {categoria === CATEGORIA_CVV && (
            <Aviso tipo="sucesso">
              <Texto variante="destaque" cor="success">
                Se for você ou alguém próximo
              </Texto>
              <Texto variante="legenda">
                Ligue 188 (CVV). É gratuito, sigiloso e funciona 24 horas.
              </Texto>
            </Aviso>
          )}
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
            dica={`Data, valor e como você chegou ao perfil ajudam. ${descricao.length}/${MAX_DESCRICAO}`}
          />
        </Secao>
      )}

      {passo === 2 && (
        <Secao titulo="Anexe prints da situação">
          <Evidencias imagens={imagens} onChange={setImagens} />
          <PreviaScore
            forca={previa.forca}
            itens={previa.itens}
            texto="Se ela for confirmada, conta a favor do seu nível."
          />
        </Secao>
      )}

      {passo === 3 && (
        <Secao titulo="Confira e envie">
          {resumo.map((item) => (
            <View key={item.rotulo} style={estilos.resumo}>
              <View style={estilos.flex}>
                <Texto variante="rotulo">{item.rotulo}</Texto>
                <Texto variante="destaque" numberOfLines={1}>
                  {item.valor}
                </Texto>
              </View>
              <Pressable
                onPress={() => setPasso(item.passo)}
                accessibilityRole="button"
                accessibilityLabel={`Alterar ${item.rotulo.toLowerCase()}`}
                style={estilos.alterar}>
                <Texto variante="destaque" cor="primary">
                  Alterar
                </Texto>
              </Pressable>
            </View>
          ))}
          {!bloqueado && (
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
          )}
        </Secao>
      )}

      {!!erros.geral && <Aviso tipo="erro">{erros.geral}</Aviso>}
      <View style={estilos.rodape}>
        {passo > 0 && (
          <View style={estilos.voltar}>
            <Botao
              titulo="Voltar"
              variante="secundario"
              icone="arrow-left"
              onPress={() => setPasso((p) => p - 1)}
            />
          </View>
        )}
        <View style={estilos.flex}>
          {passo < 3 ? (
            <Botao titulo="Continuar" icone="arrow-right" onPress={avancar} />
          ) : bloqueado ? (
            <Botao
              titulo="Salvar rascunho e sair"
              variante="secundario"
              icone="archive"
              onPress={() => router.back()}
            />
          ) : (
            <Botao
              titulo="Enviar denúncia"
              icone="send"
              onPress={enviar}
              carregando={criar.isPending}
            />
          )}
        </View>
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  secao: { gap: espaco.md },
  descricao: { minHeight: 120 },
  flex: { flex: 1 },
  rodape: { flexDirection: 'row', gap: espaco.sm, marginTop: 'auto' },
  voltar: { minWidth: 120 },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  alterar: { minHeight: 44, justifyContent: 'center', paddingHorizontal: espaco.sm },
});
