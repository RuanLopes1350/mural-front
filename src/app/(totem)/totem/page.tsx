"use client"

import { useState, useEffect, useRef } from "react";
import { useEventosTotem } from "@/hooks/useEventosTotem";
import { formatarDataEvento, formatarHorarioEvento, extrairImagensEvento } from "@/lib/utils";

import 'animate.css';
import { EventoTotem, QrCodeResponse } from "@/types/eventos";

const environment = process.env.NEXT_PUBLIC_AMBIENTE || 'development';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5015';

export default function EventosPage() {
    // Estado para armazenar o tamanho da tela
    const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

    // useEffect para capturar o tamanho da tela
    useEffect(() => {
        const updateSize = () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Busca os eventos reais da API
    const { data: eventosApi, isLoading, isError } = useEventosTotem();

    // Transforma os eventos da API para o formato usado pelo componente
    const eventos: EventoTotem[] | any = eventosApi.map(evento => ({
        id: evento._id,
        titulo: evento.titulo,
        dataInicio: formatarDataEvento(evento.dataInicio),
        dataFim: formatarDataEvento(evento.dataFim),
        horario: formatarHorarioEvento(evento.dataInicio, evento.dataFim),
        local: evento.local,
        descricao: evento.descricao,
        imagens: extrairImagensEvento(evento.midia),
        cor: evento.cor,
        animacao: evento.animacao,
        categoria: evento.categoria,
        tags: evento.tags,
        link: evento.link,
        duracao: evento.duracao,
        loops: evento.loops
    }));

    // Estado que controla qual evento está sendo exibido
    const [eventoAtualIndex, setEventoAtualIndex] = useState(0);

    // Estado que controla qual imagem do evento atual está sendo exibida
    const [imagemAtualIndex, setImagemAtualIndex] = useState(0);

    // Estado que rastreia quantas vezes o evento atual já completou o ciclo de todas as suas imagens
    const [repeticoesCompletadas, setRepeticoesCompletadas] = useState(0);

    // useRef para guardar os índices atuais (resolve problema de closure)
    const eventoIndexRef = useRef(eventoAtualIndex);
    const imagemIndexRef = useRef(imagemAtualIndex);

    // Atualiza as refs sempre que os estados mudarem
    useEffect(() => {
        eventoIndexRef.current = eventoAtualIndex;
        imagemIndexRef.current = imagemAtualIndex;
    }, [eventoAtualIndex, imagemAtualIndex]);

    // useEffect que controla o slideshow automático
    useEffect(() => {
        // Só inicia o slideshow se tiver eventos
        if (eventos.length === 0) return;

        // Pega o evento atual
        const evento = eventos[eventoIndexRef.current];

        // Define a duração baseada no evento atual (padrão: 3000ms = 3 segundos)
        const duracaoAtual = evento.duracao || 3000;

        const intervalo = setInterval(() => {
            const eventoAtual = eventoIndexRef.current;
            const imagemAtual = imagemIndexRef.current;
            const eventoObj = eventos[eventoAtual];

            // Verifica se o evento tem imagens
            if (!eventoObj.imagens || eventoObj.imagens.length === 0) {
                // Se não tem imagens, pula para o próximo evento e reseta o contador
                const proximoEvento = (eventoAtual + 1) % eventos.length;
                setEventoAtualIndex(proximoEvento);
                setImagemAtualIndex(0);
                setRepeticoesCompletadas(0);
                return;
            }

            // Define quantas repetições o evento deve ter (padrão: 3)
            const repeticoesDoEvento = eventoObj.loops || 3;

            const proximaImagem = imagemAtual + 1;

            // Se ainda tem mais imagens no evento atual
            if (proximaImagem < eventoObj.imagens.length) {
                setImagemAtualIndex(proximaImagem);
            } else {
                // Completou um ciclo de todas as imagens do evento
                setRepeticoesCompletadas(prev => {
                    const novasRepeticoes = prev + 1;

                    // Se já completou o número necessário de repetições, muda para o próximo evento
                    if (novasRepeticoes >= repeticoesDoEvento) {
                        const proximoEvento = (eventoAtual + 1) % eventos.length;
                        setEventoAtualIndex(proximoEvento);
                        setImagemAtualIndex(0);
                        return 0; // Reseta o contador para o próximo evento
                    } else {
                        // Ainda precisa repetir, volta para a primeira imagem
                        setImagemAtualIndex(0);
                        return novasRepeticoes;
                    }
                });
            }

        }, duracaoAtual);

        return () => clearInterval(intervalo);
    }, [eventos, eventoAtualIndex]); // Adiciona eventoAtualIndex como dependência para recriar o intervalo quando mudar de evento

    // Animações disponíveis
    const ANIMACOES_MAP: Record<number, string> = {
        1: 'animate__fadeIn',
        2: 'animate__fadeInUp',
        3: 'animate__fadeInDown',
        4: 'animate__slideInLeft',
        5: 'animate__slideInRight',
        6: 'animate__zoomIn',
        7: 'animate__flipInX',
        8: 'animate__bounceIn',
        9: 'animate__backInDown',
        10: 'animate__backInUp',
    };

    const CORES_MAP: Record<number, string> = {
        1: 'bg-gray-900/90',      // #d2d4d7
        2: 'bg-pink-900/90',      // #f98dbe
        3: 'bg-purple-900/90',    // #b596ff
        4: 'bg-blue-900/90',      // #76adff
        5: 'bg-green-900/90',     // #77d86b
        6: 'bg-yellow-900/90',    // #f2ca77
        7: 'bg-orange-900/90',    // #fba67a
        8: 'bg-red-900/90',       // #ff766d
        9: 'bg-transparent'
    }

    const [eventoAnteriorIndex, setEventoAnteriorIndex] = useState(0);
    const mudouDeEvento = eventoAnteriorIndex !== eventoAtualIndex;

    // Estado para armazenar o QR code do evento atual
    const [qrCodeAtual, setQrCodeAtual] = useState<string | null>(null);
    const [carregandoQrCode, setCarregandoQrCode] = useState(false);

    // Estado para rastrear o ID do último evento para o qual buscamos QR code
    const [ultimoEventoIdBuscado, setUltimoEventoIdBuscado] = useState<string | null>(null);

    // useEffect separado para atualizar o eventoAnteriorIndex
    useEffect(() => {
        if (mudouDeEvento) {
            setEventoAnteriorIndex(eventoAtualIndex);
        }
    }, [eventoAtualIndex, mudouDeEvento]);

    // useEffect para buscar QR code quando o evento atual mudar
    useEffect(() => {
        // Só executa se houver eventos carregados
        if (eventos.length === 0) return;

        const eventoAtual = eventos[eventoAtualIndex];

        // Verifica se já buscamos o QR code para este evento
        if (ultimoEventoIdBuscado === eventoAtual.id) {
            return;
        }

        // Marca que estamos buscando para este evento
        setUltimoEventoIdBuscado(eventoAtual.id);

        // Se o evento não tem link, limpa o QR code
        if (!eventoAtual.link) {
            setQrCodeAtual(null);
            return;
        }

        // Função assíncrona para buscar o QR code
        async function buscarQrCode() {
            try {
                setCarregandoQrCode(true);
                const resposta = await fetch(`${apiUrl}/eventos/${eventoAtual.id}/qrcode`);

                if (!resposta.ok) {
                    throw new Error('Erro ao buscar QR code');
                }

                const dados: QrCodeResponse = await resposta.json();
                setQrCodeAtual(dados.data.qrcode);
            } catch (erro) {
                console.error('Erro ao buscar QR code:', erro);
                setQrCodeAtual(null);
            } finally {
                setCarregandoQrCode(false);
            }
        }

        buscarQrCode();
    }, [eventoAtualIndex, eventos, ultimoEventoIdBuscado]);

    function obterAnimacao() {
        if (mudouDeEvento) {
            return 'animate__animated animate__fadeIn';
        } else {
            const eventoAtual = eventos[eventoAtualIndex];
            const animacaoEvento = ANIMACOES_MAP[eventoAtual.animacao] || 'animate__fadeIn';
            return `animate__animated ${animacaoEvento}`;
        }
    }

    function obterClasseCorFundo() {
        const eventoAtual = eventos[eventoAtualIndex];
        const corFundoEvento = CORES_MAP[eventoAtual.cor] || 'bg-gray-300';
        return corFundoEvento;
    }

    // Tela de loading
    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-linear-to-br from-indigo-950 to-purple-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 2xl:h-20 2xl:w-20 border-t-2 border-b-2 2xl:border-t-2 2xl:border-b-2 border-white mx-auto mb-4 2xl:mb-4"></div>
                    <p className="text-white text-base sm:text-xl md:text-2xl 2xl:text-2xl font-inter">Carregando eventos...</p>
                </div>
            </div>
        );
    }

    // Tela de erro
    if (isError) {
        return (
            <div className="h-screen w-screen bg-linear-to-br from-red-950 to-red-800 flex items-center justify-center p-4">
                <div className="text-center p-4 sm:p-6 md:p-8 2xl:p-8">
                    <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-3xl font-inter mb-3 sm:mb-4 2xl:mb-4">❌ Erro ao carregar eventos</p>
                    <p className="text-gray-300 font-inter text-sm sm:text-base md:text-lg 2xl:text-lg">Por favor, verifique a conexão com o servidor.</p>
                </div>
            </div>
        );
    }

    // Se não houver eventos
    if (eventos.length === 0) {
        return (
            <div className="h-screen w-screen bg-linear-to-br from-indigo-950 to-purple-900 flex items-center justify-center p-4">
                <div className="text-center p-4 sm:p-6 md:p-8 2xl:p-8">
                    <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-3xl font-inter mb-3 sm:mb-4 2xl:mb-4">📅 Nenhum evento disponível</p>
                    <p className="text-gray-300 font-inter text-sm sm:text-base md:text-lg 2xl:text-lg">Não há eventos programados para exibição no momento.</p>
                </div>
            </div>
        );
    }

    // Pega o evento e imagem atuais
    const eventoAtual = eventos[eventoAtualIndex];
    const imagemAtual = eventoAtual.imagens[imagemAtualIndex];

    return (
        <>
            {/* Wrapper para animação de entrada - usa key para resetar animação ao mudar imagem */}
            <div
                data-test="fundo-animado"
                key={`wrapper-${eventoAtualIndex}-${imagemAtualIndex}`}
                className={`fixed inset-0 -z-10 overflow-hidden transition-opacity duration-300 ${obterAnimacao()}`}>
                {/* Imagem de Fundo com loop de zoom+deslize */}
                <img
                    key={`${eventoAtualIndex}-${imagemAtualIndex}`}
                    className="animate-zoomInSlide w-full h-full object-cover transition-opacity duration-300"
                    src={imagemAtual}
                    alt="Imagem de fundo do evento"
                    draggable='false'
                />
            </div>

            {/* Container do Conteúdo (Overlay + Barra Lateral) */}
            <main className="h-screen w-screen overflow-hidden bg-black/15 flex justify-end items-center sm:items-stretch relative">

                {/* Indicadores de Imagem */}
                <div className="flex flex-col gap-3 absolute bottom-4 left-20 transform -translate-x-1/2 sm:bottom-6 md:bottom-8 lg:bottom-10 xl:bottom-12 2xl:bottom-10 3xl:bottom-14 3xl:left-24 4xl:bottom-16 4xl:left-28">
                    <div className="flex gap-1 lg:gap-0.5" data-test="indicadores-imagens">
                        {Array.from({ length: eventoAtual.imagens.length || 3 }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-4.5 w-4.5 sm:h-5 sm:w-5 lg:h-4 lg:w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 rounded-full transition-all ${index === imagemAtualIndex
                                    ? 'bg-white'
                                    : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Barra de Progresso de Loops */}
                    <div className="w-20 sm:w-24 lg:w-20 3xl:w-28 4xl:w-32 h-1 sm:h-1.5 lg:h-1 3xl:h-1.5 4xl:h-2 bg-white/30 rounded-full overflow-hidden" data-test="loop-progress">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-300"
                            data-test="loop-progress-bar"
                            style={{
                                width: `${(() => {
                                    // Usa o mesmo fallback do useEffect (padrão: 3)
                                    const loops = eventoAtual.loops || 3;
                                    return ((repeticoesCompletadas + 1) / loops) * 100;
                                })()}%`
                            }}
                        />
                    </div>
                </div>

                {/* Barra Lateral de Informações */}
                <div data-test="barra-lateral" className={`relative h-auto sm:h-full w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[48%] 3xl:w-[45%] 4xl:w-[42%]
                    p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-12 3xl:p-14 4xl:p-16
                    flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 2xl:gap-5 3xl:gap-6 4xl:gap-8
                    rounded-2xl sm:rounded-tl-2xl sm:rounded-bl-2xl sm:rounded-tr-none sm:rounded-br-none 2xl:rounded-tl-2xl 2xl:rounded-bl-2xl 3xl:rounded-tl-3xl 3xl:rounded-bl-3xl
                    mx-4 sm:mx-0 my-auto sm:my-0
                    ${obterClasseCorFundo()}`}>

                    <div>
                        <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-2 3xl:mb-3 4xl:mb-4">
                            <h1 className="text-xs sm:text-sm md:text-base lg:text-xs font-bold text-gray-100 font-inter">
                                <div className="flex flex-row items-center gap-5 bg-white/50 pl-1 pr-1 rounded-md w-fit h-fit 3xl:pl-2 3xl:pr-2 4xl:pl-3 4xl:pr-3">
                                    <span className="text-[26px] sm:text-[28px] md:text-[30px] lg:text-[24px] 2xl:text-[28px] 3xl:text-[32px] 4xl:text-[36px] text-gray-100">MURAL - IFRO</span>
                                </div>
                                {environment === 'development' ? (
                                    <>
                                        {/* mostrar a resolução da tela atual - APENAS EM DESENVOLVIMENTO*/}
                                        <span className="text-red-500 ml-2 text-xs">
                                            [{screenSize.width}x{screenSize.height}]
                                            <span className="hidden sm:inline"> SM</span>
                                            <span className="hidden md:inline"> MD</span>
                                            <span className="hidden lg:inline"> LG</span>
                                            <span className="hidden xl:inline"> XL</span>
                                            <span className="hidden 2xl:inline"> 2XL</span>
                                            <span className="hidden 3xl:inline"> 3XL</span>
                                            <span className="hidden 4xl:inline"> 4XL</span>
                                        </span>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </h1>
                        </div>
                        <h1 data-test="evento-titulo" className="text-gray-100 text-3xl sm:text-4xl md:text-5xl lg:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 lg:mb-3 2xl:mb-4 3xl:mb-5 4xl:mb-6 font-inter leading-tight">
                            {eventoAtual.titulo}
                        </h1>

                        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-1.5 2xl:gap-2.5 3xl:gap-3 4xl:gap-4 text-gray-200 text-sm sm:text-base md:text-lg lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
                            <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                                <img src="/calendar.svg" alt="Calendário" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                                <p data-test="evento-data" className="font-inter">{eventoAtual.dataInicio} - {eventoAtual.dataFim}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                                <img src="/watch.svg" alt="Relógio" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                                <p data-test="evento-horario" className="font-inter">{eventoAtual.horario}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                                <img src="/gps.svg" alt="Localização" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                                <p data-test="evento-local" className="font-inter">{eventoAtual.local}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                                <img src="/category.svg" alt="Categoria" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                                <p data-test="evento-categoria" className="font-inter">{eventoAtual.categoria.toUpperCase()}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                                <img src="/tags.svg" alt="Tags" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 3xl:gap-2.5 4xl:gap-3" data-test="evento-tags">
                                    {eventoAtual.tags.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            data-test="evento-tag"
                                            className="font-inter bg-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 3xl:px-3 3xl:py-1 4xl:px-3.5 4xl:py-1.5 rounded text-sm sm:text-base md:text-lg lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl"
                                        >
                                            {tag.toLowerCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Descrição do Evento */}
                    <div className={`flex-1 flex flex-col justify-center items-center
                            ${eventoAtual.link ? 'mb-28 sm:mb-32 md:mb-36 lg:mb-44 xl:mb-48 2xl:mb-52 3xl:mb-60 4xl:mb-72' : ''}`}>
                        <div className="bg-white/10 rounded-lg 2xl:rounded-lg 3xl:rounded-xl p-3 sm:p-4 md:p-5 2xl:p-5 3xl:p-6 4xl:p-8 w-full">
                            <p data-test="evento-descricao" className="text-gray-300 font-inter text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-xl 3xl:text-2xl 4xl:text-3xl leading-relaxed line-clamp-6 sm:line-clamp-7 md:line-clamp-8 lg:line-clamp-10 2xl:line-clamp-[15] 3xl:line-clamp-[18] 4xl:line-clamp-[22] text-center">
                                {eventoAtual.descricao}
                            </p>
                        </div>
                    </div>

                    { /* LOGO DO FSLAB */}
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-10 lg:left-10 xl:bottom-12 xl:left-12 2xl:bottom-12 2xl:left-12 3xl:bottom-14 3xl:left-14 4xl:bottom-16 4xl:left-16">
                        <img src="/logo_fslab.svg" alt="Logo FSLab" className="h-12 w-auto sm:h-14 md:h-16 lg:h-12 xl:h-14 2xl:h-16 3xl:h-20 4xl:h-24" />
                    </div>

                    {/* QR Code - Absolute dentro da barra lateral */}
                    {eventoAtual.link && (
                        <div data-test="qr-container" className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 xl:bottom-12 xl:right-12 2xl:bottom-12 2xl:right-12 3xl:bottom-14 3xl:right-14 4xl:bottom-16 4xl:right-16
                            bg-white/10 rounded-lg 2xl:rounded-lg 3xl:rounded-xl
                            w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 2xl:w-48 2xl:h-48 3xl:w-56 3xl:h-56 4xl:w-64 4xl:h-64
                            p-3 sm:p-4 2xl:p-4 3xl:p-5 4xl:p-6 flex items-center justify-center 
                            shrink-0 z-10">
                            {carregandoQrCode ? (
                                <div data-test="qr-loader" className="animate-spin rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 2xl:w-12 2xl:h-12 3xl:w-14 3xl:h-14 4xl:w-16 4xl:h-16 border-t-2 border-b-2 2xl:border-t-2 2xl:border-b-2 border-white"></div>
                            ) : qrCodeAtual ? (
                                <img data-test="qr-image" src={qrCodeAtual} className="h-full w-full object-contain rounded-lg 2xl:rounded-lg 3xl:rounded-xl" alt="QR-Code" />
                            ) : (
                                <p data-test="qr-fallback" className="text-white text-center font-inter text-xs sm:text-sm 2xl:text-sm 3xl:text-base 4xl:text-lg">QR Code não disponível</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}