"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Stepper } from "@/components/ui/stepper";
import Modal from "@/components/ui/modal";
import { useCriarEvento } from "@/hooks/useCriarEvento";
import { CriarEventoForm } from "@/schema/criarEventoSchema";
import { Etapa1InformacoesBasicas } from "@/components/criar-eventos/Etapa1";
import { Etapa2UploadImagens } from "@/components/criar-eventos/Etapa2";
import { Etapa3ConfiguracoesExibicao } from "@/components/criar-eventos/Etapa3";
import { AnimationPreview } from "@/components/criar-eventos/AnimationPreview";
import { useImageDragDrop } from "@/hooks/useImageDragDrop";
import { usePreviewWindow } from "@/hooks/usePreviewWindow";

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

export default function CriarEvento() {
  const router = useRouter();
  const {
    form,
    handleFilesChange,
    handleRemoveImage,
    validImages,
    blobUrls,
    step,
    setStep,
    validateStep,
    submit,
    loading,
    clearStorage,
  } = useCriarEvento();

  const [animacaoPreview, setAnimacaoPreview] = useState<{
    nome: string;
    classe: string;
  } | null>(null);
  const [animacaoKey, setAnimacaoKey] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const imageDragDrop = useImageDragDrop(handleFilesChange);
  const { openPreview, closePreview } = usePreviewWindow();

  const handleContinue = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: CriarEventoForm) => {
    if (step !== 3) return;

    const isValid = await validateStep(step);
    if (!isValid) return;

    const ok = await submit(data);
    if (ok) {
      closePreview();
      router.push("/meus_eventos");
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    closePreview();
    clearStorage();
    router.push("/meus_eventos");
  };

  const handleAnimacaoPreview = (preview: { nome: string; classe: string } | null) => {
    setAnimacaoPreview(preview);
  };

  const handleAnimacaoKeyChange = () => {
    setAnimacaoKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-test="criar-evento-page">
      {step > 1 && (
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={handleBack}
            data-test="btn-voltar"
            className="flex items-center gap-2 text-[#805AD5] hover:text-[#6B46C1] bg-transparent hover:bg-purple-50 border-none shadow-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-[#1A202C] mb-2">Criar Novo Evento</h1>
        <p className="text-[#718096] mb-8">
          Preencha os detalhes do seu evento para exibição no totem digital
        </p>
      </div>

      <div className="mb-10">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && <Etapa1InformacoesBasicas form={form} />}

            {step === 2 && (
              <Etapa2UploadImagens
                validImages={validImages}
                isDragging={imageDragDrop.isDragging}
                onDragOver={imageDragDrop.handleDragOver}
                onDragLeave={imageDragDrop.handleDragLeave}
                onDrop={imageDragDrop.handleDrop}
                onFileInputChange={imageDragDrop.handleFileInputChange}
                onRemoveImage={handleRemoveImage}
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
              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                data-test="btn-cancelar"
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#CBD5E0] text-[#4A5568] rounded-lg hover:bg-[#F7FAFC] transition-colors font-medium order-2 sm:order-1"
              >
                Cancelar
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                {step === 3 && (
                  <Button
                    type="button"
                    onClick={async () => await openPreview(blobUrls)}
                    disabled={loading || validImages.length === 0}
                    data-test="btn-preview"
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title={validImages.length === 0 ? "Adicione imagens para visualizar o preview" : "Ver preview do evento"}
                  >
                    <svg className="cursor-pointer transition w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                    data-test="btn-finalizar"
                    className="w-full sm:w-auto px-8 py-3 bg-[#805AD5] hover:bg-[#6B46C1] text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Carregando..." : "Finalizar"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      <AnimationPreview animacaoPreview={animacaoPreview} animacaoKey={animacaoKey} />

      <Modal
        titulo="Cancelar criação do evento?"
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        data-test="modal-cancelar-criacao"
      >
        <p className="text-gray-700 mb-4">
          Os dados preenchidos serão perdidos. Tem certeza que deseja cancelar?
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={() => setShowCancelModal(false)} 
            data-test="modal-btn-voltar"
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Voltar
          </button>
          <button 
            onClick={confirmCancel} 
            data-test="modal-btn-confirmar-cancelar"
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Sim, cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}