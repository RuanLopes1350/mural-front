"use client";

import "animate.css";

interface AnimationPreviewProps {
  animacaoPreview: {
    nome: string;
    classe: string;
  } | null;
  animacaoKey: number;
}

export function AnimationPreview({ animacaoPreview, animacaoKey }: AnimationPreviewProps) {
  if (!animacaoPreview) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-2xl border-2 border-[#805AD5] p-6 z-50 w-[200px]">
      <p className="text-sm font-semibold text-[#2D3748] mb-3 text-center">
        {animacaoPreview.nome}
      </p>
      <div className="flex items-center justify-center w-full h-32 bg-purple-50 rounded-lg overflow-hidden">
        <div
          key={animacaoKey}
          className={`w-16 h-16 bg-[#805AD5] rounded-lg shadow-lg animate__animated ${animacaoPreview.classe}`}
        ></div>
      </div>
    </div>
  );
}
