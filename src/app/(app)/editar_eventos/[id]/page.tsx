"use client";

import { useRouter, useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Etapa1InformacoesBasicas } from "@/components/criar-eventos/Etapa1";
import { Etapa2UploadImagens } from "@/components/criar-eventos/Etapa2";
import { Etapa3ConfiguracoesExibicao } from "@/components/criar-eventos/Etapa3";
import { CompartilharPermissoes } from "@/components/criar-eventos/CompartilharPermissoes";
import { AnimationPreview } from "@/components/criar-eventos/AnimationPreview";
import { Stepper } from "@/components/ui/stepper";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useCriarEvento } from "@/hooks/useCriarEvento";
import { useEvento } from "@/hooks/useEventos";
import { useImageDragDrop } from "@/hooks/useImageDragDrop";
import { usePreviewWindow } from "@/hooks/usePreviewWindow";
import { useSession } from "next-auth/react";
import { ThreeDot } from "react-loading-indicators";
import { CriarEventoForm } from "@/schema/criarEventoSchema";
import { useQueryClient } from "@tanstack/react-query";

const STEPS = [
  {
    number: 1,
    title: "Informações Básicas",
    description: "Detalhes do evento",
  },
  {
    number: 2,
    title: "Upload de Mídia",
    description: "Imagens do evento",
  },
  {
    number: 3,
    title: "Configurações",
    description: "Exibição e aparência",
  },
];

function EditarEventoContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    form,
    handleFilesChange,
    handleRemoveImage,
    handleRemoveExistingMedia,
    validImages,
    blobUrls,
    existingMedia,
    mediaToDelete,
    step,
    setStep,
    validateStep,
    submit,
    loading,
    loadEventData,
  } = useCriarEvento({ eventId: eventId || undefined, isEditMode: true });

  const { data: eventoData, isLoading: isLoadingEvento } = useEvento(eventId || "");
  const { openPreview, closePreview } = usePreviewWindow();

  const [animacaoPreview, setAnimacaoPreview] = useState<{
    nome: string;
    classe: string;
  } | null>(null);
  const [animacaoKey, setAnimacaoKey] = useState(0);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [usuariosCompartilhados, setUsuariosCompartilhados] = useState<Array<{ _id: string; email: string }>>([]);

  const imageDragDrop = useImageDragDrop(handleFilesChange);

  // Carregar usuários compartilhados quando os dados do evento chegarem
  useEffect(() => {
    if (eventoData?.data?.permissoes && Array.isArray(eventoData.data.permissoes)) {
      const usuarios = eventoData.data.permissoes.map((permissao: any) => ({
        _id: permissao.usuario,
        email: permissao.email,
      }));
      setUsuariosCompartilhados(usuarios);
    }
  }, [eventoData]);

  // Carregar dados do evento quando disponíveis (apenas uma vez)
  useEffect(() => {
    if (eventoData?.data && loadEventData && !hasLoadedData) {
      loadEventData(eventoData.data);
      setHasLoadedData(true);
    }
  }, [eventoData, loadEventData, hasLoadedData]);

  // Salvar dados no localStorage para o preview (quando o formulário mudar)
  useEffect(() => {
    if (!hasLoadedData || typeof window === "undefined") return;

    const subscription = form.watch((formValues) => {
      localStorage.setItem('criar_evento_draft', JSON.stringify(formValues));

      // Salvar imagens para o preview
      const allImages: string[] = [
        ...existingMedia
          .filter(media => !mediaToDelete.includes(media._id))
          .map(media => media.midiLink),
        ...blobUrls
      ];

      if (allImages.length > 0) {
        localStorage.setItem('criar-evento-images', JSON.stringify(allImages));
      } else {
        localStorage.removeItem('criar-evento-images');
      }
    });

    return () => subscription.unsubscribe();
  }, [form, existingMedia, mediaToDelete, blobUrls, hasLoadedData]);

  const handleContinue = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const isValid = await validateStep(step);
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: CriarEventoForm) => {
    if (step !== 3) return;

    const isValid = await validateStep(step);
    if (!isValid) return;

    const ok = await submit(data);
    if (ok) {
      closePreview();
      // Limpar localStorage após salvar com sucesso
      localStorage.removeItem('criar_evento_draft');
      localStorage.removeItem('criar-evento-images');
      router.push("/meus_eventos");
    }
  };

  const handleAnimacaoPreview = (preview: { nome: string; classe: string } | null) => {
    setAnimacaoPreview(preview);
  };

  const handleAnimacaoKeyChange = () => {
    setAnimacaoKey(prev => prev + 1);
  };

  const handleUsuarioAdicionado = (usuario: { _id: string; email: string }) => {
    setUsuariosCompartilhados(prev => [...prev, usuario]);
    queryClient.invalidateQueries({ queryKey: ["usuarios-compartilhados", eventId] });
  };

  const handleUsuarioRemovido = (usuarioId: string) => {
    setUsuariosCompartilhados(prev => prev.filter(u => u._id !== usuarioId));
    queryClient.invalidateQueries({ queryKey: ["usuarios-compartilhados", eventId] });
  };

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ID do evento não encontrado
          </h3>
          <p className="text-red-600">
            Por favor, acesse esta página através da lista de eventos.
          </p>
          <button
            onClick={() => router.push("/meus_eventos")}
            className="cursor-pointer transition mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Voltar aos Eventos
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingEvento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <ThreeDot variant="bounce" color="#4338CA" size="medium" text="" textColor="" />
          <span className="mt-3 text-gray-600">Carregando evento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-test="editar-evento-page">
      {step > 1 && (
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={handleBack}
            data-test="btn-voltar"
            className="flex items-center gap-2 text-[#805AD5] hover:text-[#6B46C1] bg-transparent hover:bg-purple-50 border-none shadow-none">
            <svg className="cursor-pointer transition w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-[#1A202C] mb-2">Editar Evento</h1>
        <p className="text-[#718096] mb-8">
          Atualize as informações do seu evento
        </p>
      </div>

      <div className="mb-10">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <>
                <Etapa1InformacoesBasicas form={form} />

                {/* Seção de compartilhamento de permissões */}
                <div className="pt-8 mt-8 border-t border-[#E2E8F0]">
                  <CompartilharPermissoes
                    eventId={eventId}
                    usuariosCompartilhados={usuariosCompartilhados}
                    onUsuarioAdicionado={handleUsuarioAdicionado}
                    onUsuarioRemovido={handleUsuarioRemovido}
                    accessToken={session?.user?.accesstoken}
                    userEmail={session?.user?.email}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <Etapa2UploadImagens
                validImages={validImages}
                existingMedia={existingMedia}
                mediaToDelete={mediaToDelete}
                isDragging={imageDragDrop.isDragging}
                onDragOver={imageDragDrop.handleDragOver}
                onDragLeave={imageDragDrop.handleDragLeave}
                onDrop={imageDragDrop.handleDrop}
                onFileInputChange={imageDragDrop.handleFileInputChange}
                onRemoveImage={handleRemoveImage}
                onRemoveExistingMedia={handleRemoveExistingMedia}
              />
            )}

            {step === 3 && (
              <Etapa3ConfiguracoesExibicao
                form={form}
                onAnimacaoPreview={handleAnimacaoPreview}
                onAnimacaoKeyChange={handleAnimacaoKeyChange}
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-8 mt-8 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 order-2 sm:order-1">
                <Button
                  type="button"
                  onClick={() => {
                    closePreview();
                    // Limpar localStorage ao cancelar edição para não interferir na criação de novos eventos
                    localStorage.removeItem('criar_evento_draft');
                    localStorage.removeItem('criar-evento-images');
                    router.push("/meus_eventos");
                  }}
                  disabled={loading}
                  data-test="btn-cancelar"
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-[#CBD5E0] text-[#4A5568] rounded-lg hover:bg-[#F7FAFC] transition-colors font-medium"
                >
                  Cancelar
                </Button>

                {/* Indicador de mídias marcadas para exclusão */}
                {mediaToDelete.length > 0 && (
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-orange-700">
                      {mediaToDelete.length} mídia(s) será(ão) excluída(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                {step === 3 && (
                  <Button
                    type="button"
                    onClick={async () => {
                      // Combinar imagens existentes (não deletadas) com as novas
                      const existingUrls = existingMedia
                        .filter(m => !mediaToDelete.includes(m._id))
                        .map(m => m.midiLink);
                      const allImages = [...existingUrls, ...blobUrls];
                      await openPreview(allImages);
                    }}
                    disabled={loading || (validImages.length === 0 && existingMedia.filter(m => !mediaToDelete.includes(m._id)).length === 0)}
                    data-test="btn-preview"
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title={(validImages.length === 0 && existingMedia.filter(m => !mediaToDelete.includes(m._id)).length === 0) ? "Adicione imagens para visualizar o preview" : "Ver preview do evento"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.923 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={loading}
                    data-test="btn-continuar"
                    className="w-full sm:w-auto px-8 py-3 bg-[#805AD5] hover:bg-[#6B46C1] text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    data-test="btn-salvar"
                    className="w-full sm:w-auto px-8 py-3 bg-[#805AD5] hover:bg-[#6B46C1] text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      <AnimationPreview animacaoPreview={animacaoPreview} animacaoKey={animacaoKey} />
    </div>
  );
}

export default function EditarEventoPage() {
  return (
    <Suspense fallback={
      <div className="cursor-pointer transition min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <ThreeDot variant="bounce" color="#4338CA" size="medium" text="" textColor="" />
          <span className="mt-3 text-gray-600">Carregando...</span>
        </div>
      </div>
    }>
      <EditarEventoContent />
    </Suspense>
  );
}
