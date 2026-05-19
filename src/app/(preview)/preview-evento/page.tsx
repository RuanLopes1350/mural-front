"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatarDataEvento, formatarHorarioEvento } from "@/lib/utils";
import { calcularDuracaoPorImagem } from "@/lib/calculadoraDuracao";
import "animate.css";

const environment = process.env.NEXT_PUBLIC_AMBIENTE || "development";

export default function PreviewEvento() {
  const router = useRouter();

  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [eventoPreview, setEventoPreview] = useState<any>(null);
  const [imagemAtualIndex, setImagemAtualIndex] = useState(0);
  const [repeticoesCompletadas, setRepeticoesCompletadas] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [carregandoQrCode, setCarregandoQrCode] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const carregarDadosPreview = useCallback(() => {
    const dadosForm = localStorage.getItem("criar_evento_draft");
    // Agora lemos do sessionStorage para evitar estouro de cota do localStorage
    const blobUrlsStorage = sessionStorage.getItem("preview-evento-blobs");
    const existingImagesStorage = localStorage.getItem("criar-evento-images");

    if (!dadosForm) {
      if (window.opener) {
        window.close();
      } else {
        router.push("/criar_eventos");
      }
      return;
    }

    try {
      const form = JSON.parse(dadosForm);
      let imagens: string[] = [];

      if (blobUrlsStorage) {
        try {
          imagens = JSON.parse(blobUrlsStorage) || [];
        } catch {
          imagens = [];
        }
      }

      if (imagens.length === 0 && existingImagesStorage) {
        try {
          imagens = JSON.parse(existingImagesStorage) || [];
        } catch {
          imagens = [];
        }
      }

      const formatarCategoria = (cat: string) => {
        const categorias: Record<string, string> = {
          palestra: "Palestra",
          workshop: "Workshop",
          seminario: "Seminário",
          curso: "Curso",
          esportivo: "Esportivo",
          outros: "Outros",
        };
        return categorias[cat] || cat.toUpperCase();
      };

      const duracaoCalculada = calcularDuracaoPorImagem(imagens.length);

      setEventoPreview({
        titulo: form.titulo || "Título do Evento",
        descricao: form.descricao || "Descrição do evento",
        categoria: formatarCategoria(form.categoria || "outros"),
        local: form.local || "Local do evento",
        dataInicio: form.dataInicio ? formatarDataEvento(form.dataInicio) : "Data",
        dataFim: form.dataFim ? formatarDataEvento(form.dataFim) : "Data",
        horario: form.dataInicio && form.dataFim ? formatarHorarioEvento(form.dataInicio, form.dataFim) : "Horário",
        tags: form.tags || [],
        imagens,
        cor: parseInt(form.cor, 10) || 1,
        animacao: parseInt(form.animacao, 10) || 1,
        duracao: duracaoCalculada,
        loops: 3,
        link: form.link,
      });
    } catch {
      if (window.opener) {
        window.close();
      } else {
        router.push("/criar_eventos");
      }
    }
  }, [router]);

  useEffect(() => {
    carregarDadosPreview();
  }, [carregarDadosPreview]);

  useEffect(() => {
    if (!eventoPreview || !eventoPreview.imagens || eventoPreview.imagens.length === 0) return;

    const len = eventoPreview.imagens.length;
    const loops = eventoPreview.loops || 3;
    const duracao = eventoPreview.duracao || 3000;

    const intervalo = setInterval(() => {
      setImagemAtualIndex((prev) => {
        const proxima = prev + 1;
        if (proxima < len) {
          return proxima;
        }

        setRepeticoesCompletadas((prevRep) => {
          const novas = prevRep + 1;
          if (novas >= loops) {
            return 0;
          }
          return novas;
        });

        return 0;
      });
    }, duracao);

    return () => clearInterval(intervalo);
  }, [eventoPreview]);

  useEffect(() => {
    if (eventoPreview && eventoPreview.link) {
      setCarregandoQrCode(true);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventoPreview.link)}`;
      setQrCodeUrl(qrUrl);
      setCarregandoQrCode(false);
    } else {
      setQrCodeUrl(null);
      setCarregandoQrCode(false);
    }
  }, [eventoPreview]);

  const ANIMACOES_MAP: Record<number, string> = {
    1: "animate__fadeIn",
    2: "animate__fadeInUp",
    3: "animate__fadeInDown",
    4: "animate__slideInLeft",
    5: "animate__slideInRight",
    6: "animate__zoomIn",
    7: "animate__flipInX",
    8: "animate__bounceIn",
    9: "animate__backInDown",
    10: "animate__backInUp",
  };

  const CORES_MAP: Record<number, string> = {
    1: "bg-gray-900/90",
    2: "bg-pink-900/90",
    3: "bg-purple-900/90",
    4: "bg-blue-900/90",
    5: "bg-green-900/90",
    6: "bg-yellow-900/90",
    7: "bg-orange-900/90",
    8: "bg-red-900/90",
    9: "bg-transparent",
  };

  function obterAnimacao() {
    const animacaoEvento = ANIMACOES_MAP[eventoPreview?.animacao] || "animate__fadeIn";
    return `animate__animated ${animacaoEvento}`;
  }

  function obterClasseCorFundo() {
    return CORES_MAP[eventoPreview?.cor] || "bg-gray-900/90";
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

  const imagemAtual = eventoPreview.imagens?.[imagemAtualIndex] || "";

  return (
    <>
      <div
        data-test="fundo-animado"
        key={`wrapper-${imagemAtualIndex}`}
        className={`fixed inset-0 -z-10 overflow-hidden transition-opacity duration-300 ${obterAnimacao()}`}
      >
        <img
          key={`${imagemAtualIndex}`}
          className="animate-zoomInSlide w-full h-full object-cover transition-opacity duration-300"
          src={imagemAtual}
          alt="Imagem de fundo do evento"
          draggable="false"
        />
      </div>

      <main className="h-screen w-screen overflow-hidden bg-black/15 flex justify-end items-center sm:items-stretch relative">
        <div className="flex flex-col gap-3 absolute bottom-4 left-20 transform -translate-x-1/2 sm:bottom-6 md:bottom-8 lg:bottom-10 xl:bottom-12 2xl:bottom-10 3xl:bottom-14 3xl:left-24 4xl:bottom-16 4xl:left-28">
          <div className="flex gap-1 lg:gap-0.5" data-test="indicadores-imagens">
            {Array.from({ length: eventoPreview.imagens.length || 1 }).map((_, index) => (
              <div
                key={index}
                className={`h-4.5 w-4.5 sm:h-5 sm:w-5 lg:h-4 lg:w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 rounded-full transition-all ${
                  index === imagemAtualIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          <div className="w-20 sm:w-24 lg:w-20 3xl:w-28 4xl:w-32 h-1 sm:h-1.5 lg:h-1 3xl:h-1.5 4xl:h-2 bg-white/30 rounded-full overflow-hidden" data-test="loop-progress">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              data-test="loop-progress-bar"
              style={{
                width: `${(() => {
                  const loops = eventoPreview.loops || 3;
                  return ((repeticoesCompletadas + 1) / loops) * 100;
                })()}%`,
              }}
            />
          </div>
        </div>

        <div
          data-test="barra-lateral"
          className={`relative h-auto sm:h-full w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[48%] 3xl:w-[45%] 4xl:w-[42%]
            p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-12 3xl:p-14 4xl:p-16
            flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 2xl:gap-5 3xl:gap-6 4xl:gap-8
            rounded-2xl sm:rounded-tl-2xl sm:rounded-bl-2xl sm:rounded-tr-none sm:rounded-br-none 2xl:rounded-tl-2xl 2xl:rounded-bl-2xl 3xl:rounded-tl-3xl 3xl:rounded-bl-3xl
            mx-4 sm:mx-0 my-auto sm:my-0
            ${obterClasseCorFundo()}`}
        >
          <div>
            <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-2 3xl:mb-3 4xl:mb-4">
              <h1 className="text-xs sm:text-sm md:text-base lg:text-xs font-bold text-gray-100 font-inter">
                <div className="flex flex-row items-center gap-5 bg-white/50 pl-1 pr-1 rounded-md w-fit h-fit 3xl:pl-2 3xl:pr-2 4xl:pl-3 4xl:pr-3">
                  <span className="text-[26px] sm:text-[28px] md:text-[30px] lg:text-[24px] 2xl:text-[28px] 3xl:text-[32px] 4xl:text-[36px] text-gray-100">MURAL - IFRO</span>
                </div>
                {environment === "development" ? (
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
                ) : null}
              </h1>
            </div>

            <h1 data-test="evento-titulo" className="text-gray-100 text-3xl sm:text-4xl md:text-5xl lg:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 lg:mb-3 2xl:mb-4 3xl:mb-5 4xl:mb-6 font-inter leading-tight">
              {eventoPreview.titulo}
            </h1>

            <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-1.5 2xl:gap-2.5 3xl:gap-3 4xl:gap-4 text-gray-200 text-sm sm:text-base md:text-lg lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
              <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                <img src="/calendar.svg" alt="Calendário" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                <p data-test="evento-data" className="font-inter">{eventoPreview.dataInicio} - {eventoPreview.dataFim}</p>
              </div>
              <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                <img src="/watch.svg" alt="Relógio" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                <p data-test="evento-horario" className="font-inter">{eventoPreview.horario}</p>
              </div>
              <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                <img src="/gps.svg" alt="Localização" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                <p data-test="evento-local" className="font-inter">{eventoPreview.local}</p>
              </div>
              <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                <img src="/category.svg" alt="Categoria" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                <p data-test="evento-categoria" className="font-inter">{eventoPreview.categoria.toUpperCase()}</p>
              </div>
              <div className="flex flex-row gap-2 lg:gap-1.5 3xl:gap-2.5 4xl:gap-3 items-center">
                <img src="/tags.svg" alt="Tags" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7 shrink-0" />
                <div className="flex flex-wrap gap-1.5 sm:gap-2 3xl:gap-2.5 4xl:gap-3" data-test="evento-tags">
                  {eventoPreview.tags.map((tag: string, index: number) => (
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

          <div className={`flex-1 flex flex-col justify-center items-center ${eventoPreview.link ? "mb-28 sm:mb-32 md:mb-36 lg:mb-44 xl:mb-48 2xl:mb-52 3xl:mb-60 4xl:mb-72" : ""}`}>
            <div className="bg-white/10 rounded-lg 2xl:rounded-lg 3xl:rounded-xl p-3 sm:p-4 md:p-5 2xl:p-5 3xl:p-6 4xl:p-8 w-full">
              <p data-test="evento-descricao" className="text-gray-300 font-inter text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-xl 3xl:text-2xl 4xl:text-3xl leading-relaxed line-clamp-6 sm:line-clamp-7 md:line-clamp-8 lg:line-clamp-10 2xl:line-clamp-15 3xl:line-clamp-18 4xl:line-clamp-22 text-center">
                {eventoPreview.descricao}
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-10 lg:left-10 xl:bottom-12 xl:left-12 2xl:bottom-12 2xl:left-12 3xl:bottom-14 3xl:left-14 4xl:bottom-16 4xl:left-16">
            <img src="/logo_fslab.svg" alt="Logo FSLab" className="h-24 w-auto sm:h-26 md:h-26 lg:h-24 xl:h-26 2xl:h-28 3xl:h-32 4xl:h-36" />
          </div>

          {eventoPreview.link && (
            <div data-test="qr-container" className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 xl:bottom-12 xl:right-12 2xl:bottom-12 2xl:right-12 3xl:bottom-14 3xl:right-14 4xl:bottom-16 4xl:right-16
              bg-white/10 rounded-lg 2xl:rounded-lg 3xl:rounded-xl
              w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 2xl:w-48 2xl:h-48 3xl:w-56 3xl:h-56 4xl:w-64 4xl:h-64
              p-3 sm:p-4 2xl:p-4 3xl:p-5 4xl:p-6 flex items-center justify-center
              shrink-0 z-10">
              {carregandoQrCode ? (
                <div data-test="qr-loader" className="animate-spin rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 2xl:w-12 2xl:h-12 3xl:w-14 3xl:h-14 4xl:w-16 4xl:h-16 border-t-2 border-b-2 2xl:border-t-2 2xl:border-b-2 border-white"></div>
              ) : qrCodeUrl ? (
                <img data-test="qr-image" src={qrCodeUrl} className="h-full w-full object-contain rounded-lg 2xl:rounded-lg 3xl:rounded-xl" alt="QR-Code" />
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
