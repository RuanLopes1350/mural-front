"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatarDataEvento, formatarHorarioEvento } from "@/lib/utils";
import { calcularDuracaoPorImagem } from "@/lib/calculadoraDuracao";
import 'animate.css';

export default function PreviewEvento() {
    const router = useRouter();
    const [eventoPreview, setEventoPreview] = useState<any>(null);
    const [imagemAtualIndex, setImagemAtualIndex] = useState(0);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [repeticoesCompletadas, setRepeticoesCompletadas] = useState(0);

    // Função para carregar os dados do preview
    const carregarDadosPreview = useCallback(() => {
        const dadosForm = localStorage.getItem('criar_evento_draft');

        // Buscar as imagens do localStorage (sessionStorage não é compartilhado entre janelas)
        const blobUrlsStorage = localStorage.getItem('preview-evento-blobs');
        // Fallback: tentar também do criar-evento-images (onde as imagens existentes são salvas)
        const existingImagesStorage = localStorage.getItem('criar-evento-images');

        if (!dadosForm) {
            // Voltar para criar ou editar
            if (window.opener) {
                window.close();
            } else {
                router.push('/criar_eventos');
            }
            return;
        }

        try {
            const form = JSON.parse(dadosForm);
            let imagens: string[] = [];

            // Tentar carregar os blob URLs do localStorage primeiro
            if (blobUrlsStorage) {
                try {
                    imagens = JSON.parse(blobUrlsStorage) || [];
                } catch (e) {
                    console.warn('Falha ao parsear preview-evento-blobs', e);
                    imagens = [];
                }
            }

            // Se não tiver blob URLs, tentar usar as imagens existentes (modo edição)
            if (imagens.length === 0 && existingImagesStorage) {
                try {
                    imagens = JSON.parse(existingImagesStorage) || [];
                } catch (e) {
                    console.warn('Falha ao parsear criar-evento-images', e);
                    imagens = [];
                }
            }

            console.log('=== DEBUG PREVIEW ===');
            console.log('Formulário carregado:', form);
            console.log('Imagens carregadas:', imagens);
            console.log('Total de imagens:', imagens.length);

            // Formatar categoria para exibição correta
            const formatarCategoria = (cat: string) => {
                const categorias: Record<string, string> = {
                    'palestra': 'Palestra',
                    'workshop': 'Workshop',
                    'seminario': 'Seminário',
                    'curso': 'Curso',
                    'esportivo': 'Esportivo',
                    'outros': 'Outros'
                };
                return categorias[cat] || cat.toUpperCase();
            };

            // Calcula a duração baseada na quantidade de imagens
            const duracaoCalculada = calcularDuracaoPorImagem(imagens.length);

            const previewData = {
                titulo: form.titulo || "Título do Evento",
                descricao: form.descricao || "Descrição do evento",
                categoria: formatarCategoria(form.categoria || "outros"),
                local: form.local || "Local do evento",
                dataInicio: form.dataInicio ? formatarDataEvento(form.dataInicio) : "Data",
                dataFim: form.dataFim ? formatarDataEvento(form.dataFim) : "Data",
                horario: (form.dataInicio && form.dataFim) ? formatarHorarioEvento(form.dataInicio, form.dataFim) : "Horário",
                tags: form.tags || [],
                imagens: imagens,
                cor: parseInt(form.cor) || 1,
                animacao: parseInt(form.animacao) || 1,
                duracao: duracaoCalculada, // Duração calculada automaticamente
                loops: 3, // Padrão para preview (não usado porque não tem outros eventos)
                link: form.link
            };

            console.log('Preview data final:', previewData);
            setEventoPreview(previewData);
        } catch (error) {
            console.error("Erro ao carregar dados do preview:", error);
            if (window.opener) {
                window.close();
            } else {
                router.push('/criar_eventos');
            }
        }
    }, [router]);

    // Carrega os dados do localStorage quando a página é montada
    useEffect(() => {
        carregarDadosPreview();
    }, [carregarDadosPreview]);

    // useEffect para slideshow automático com duração calculada
    useEffect(() => {
        if (!eventoPreview || !eventoPreview.imagens || eventoPreview.imagens.length === 0) return;

        const len = eventoPreview.imagens.length;
        const loops = eventoPreview.loops || 3;
        // Usa a duração calculada do evento (em milissegundos)
        const duracao = eventoPreview.duracao || 3000;

        console.log(`⏱️ Preview usando duração de ${duracao}ms (${duracao / 1000}s) para ${len} imagens`);

        const intervalo = setInterval(() => {
            setImagemAtualIndex((prev) => {
                const proxima = prev + 1;
                if (proxima < len) {
                    return proxima;
                }

                // Completou um ciclo de imagens
                setRepeticoesCompletadas((prevRep) => {
                    const novas = prevRep + 1;
                    if (novas >= loops) {
                        // Resetar contador de repetições
                        return 0;
                    }
                    return novas;
                });

                return 0;
            });
        }, duracao);

        return () => clearInterval(intervalo);
    }, [eventoPreview]);

    // gerar QR code quando tiver link
    useEffect(() => {
        if (eventoPreview && eventoPreview.link) {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventoPreview.link)}`;
            setQrCodeUrl(qrUrl);
        } else {
            setQrCodeUrl(null);
        }
    }, [eventoPreview]);

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
        1: 'bg-gray-900/90',
        2: 'bg-pink-900/90',
        3: 'bg-purple-900/90',
        4: 'bg-blue-900/90',
        5: 'bg-green-900/90',
        6: 'bg-yellow-900/90',
        7: 'bg-orange-900/90',
        8: 'bg-red-900/90',
        9: 'bg-transparent'
    };

    function obterAnimacao() {
        const animacaoEvento = ANIMACOES_MAP[eventoPreview?.animacao] || 'animate__fadeIn';
        return `animate__animated ${animacaoEvento}`;
    }

    function obterClasseCorFundo() {
        return CORES_MAP[eventoPreview?.cor] || 'bg-gray-900/90';
    }

    if (!eventoPreview) {
        return (
            <div className="h-screen w-screen bg-linear-to-br from-indigo-950 to-purple-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 2xl:h-20 2xl:w-20 border-t-2 border-b-2 2xl:border-t-2 2xl:border-b-2 border-white mx-auto mb-4 2xl:mb-4"></div>
                    <p className="text-white text-base sm:text-xl md:text-2xl 2xl:text-2xl font-inter">Carregando preview...</p>
                </div>
            </div>
        );
    }

    const imagemAtual = eventoPreview.imagens[imagemAtualIndex];
    const animacaoClasse = obterAnimacao();
    const corFundo = obterClasseCorFundo();

    return (
        <>
            {/* Botão de atualizar no canto superior direito */}
            <button
                onClick={() => window.location.reload()}
                className="cursor-pointer fixed top-6 right-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 flex items-center justify-center shadow-lg transition-all hover:scale-110 group"
                title="Atualizar preview"
            >
                <svg
                    className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
            </button>

            {/* Imagem de Fundo */}
            <img
                key={imagemAtualIndex}
                className={`fixed inset-0 object-cover w-full h-full -z-10 animate__animated ${animacaoClasse}`}
                src={imagemAtual}
                alt="Imagem de fundo do evento"
                draggable='false'
            />

            {/* Container do Conteúdo */}
            <main className="h-screen w-screen overflow-hidden bg-black/15 flex justify-end items-center sm:items-stretch relative">
                {/* Barra Lateral de Informações */}
                <div className={`relative h-auto sm:h-full w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:max-w-2xl
                    p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-10
                    flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 2xl:gap-4
                    rounded-2xl sm:rounded-tl-2xl sm:rounded-bl-2xl sm:rounded-tr-none sm:rounded-br-none 2xl:rounded-tl-2xl 2xl:rounded-bl-2xl
                    mx-4 sm:mx-0 my-auto sm:my-0
                    ${corFundo}`}>

                    <div className="grow">
                        <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-2">
                            <p className="text-xs sm:text-sm md:text-base lg:text-xs font-semibold text-gray-300 font-inter">
                                IFRO EVENTS - PREVIEW
                            </p>
                            <div className="flex gap-1 lg:gap-0.5">
                                {Array.from({ length: eventoPreview.loops || 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-1 lg:w-1 rounded-full transition-all ${index <= repeticoesCompletadas ? 'bg-white' : 'bg-white/30'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 lg:mb-3 font-inter leading-tight">
                            {eventoPreview.titulo}
                        </h1>

                        <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-1.5 text-gray-200 text-xs sm:text-sm md:text-base lg:text-sm">
                            <div className="flex flex-row gap-2 lg:gap-1.5 items-center">
                                <img src="/calendar.svg" alt="Calendário" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 shrink-0" />
                                <p className="font-inter">{eventoPreview.dataInicio} - {eventoPreview.dataFim}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 items-center">
                                <img src="/watch.svg" alt="Relógio" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 shrink-0" />
                                <p className="font-inter">{eventoPreview.horario}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 items-center">
                                <img src="/gps.svg" alt="Localização" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 shrink-0" />
                                <p className="font-inter">{eventoPreview.local}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 items-center">
                                <img src="/category.svg" alt="Categoria" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 shrink-0" />
                                <p className="font-inter">{eventoPreview.categoria.toUpperCase()}</p>
                            </div>
                            <div className="flex flex-row gap-2 lg:gap-1.5 items-center">
                                <img src="/tags.svg" alt="Tags" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 shrink-0" />
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {eventoPreview.tags.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="font-inter bg-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs sm:text-sm md:text-base lg:text-sm"
                                        >
                                            {tag.toLowerCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Descrição do Evento */}
                    <div className={`flex-1 max-h-[120px] sm:max-h-[150px] md:max-h-[180px] lg:max-h-[220px] xl:max-h-[250px] 2xl:max-h-80
                            min-h-0 bg-white/10 rounded-lg 2xl:rounded-lg p-3 sm:p-4 md:p-5 2xl:p-4 overflow-hidden
                            ${eventoPreview.link ? 'mb-28 sm:mb-32 md:mb-36 lg:mb-44 xl:mb-48 2xl:mb-52' : ''}`}>
                        <p className="text-gray-300 font-inter text-xs sm:text-sm md:text-base lg:text-lg 2xl:text-base leading-relaxed line-clamp-6 sm:line-clamp-7 md:line-clamp-8 lg:line-clamp-10 2xl:line-clamp-15">
                            {eventoPreview.descricao}
                        </p>
                    </div>

                    {/* QR Code */}
                    {eventoPreview.link && (
                        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 xl:bottom-12 xl:right-12 2xl:bottom-10 2xl:right-10
                            bg-white/10 rounded-lg 2xl:rounded-lg
                            w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 2xl:w-48 2xl:h-48
                            p-3 sm:p-4 2xl:p-4 flex items-center justify-center 
                            shrink-0 z-10">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    className="h-full w-full object-contain rounded-lg 2xl:rounded-lg"
                                    alt="QR Code do evento"
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="text-white/50 text-4xl mb-2">📱</div>
                                    <p className="text-white/70 text-xs font-inter">Gerando QR Code...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
