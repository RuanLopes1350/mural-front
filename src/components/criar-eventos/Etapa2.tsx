"use client";

interface Etapa2UploadImagensProps {
  validImages: File[];
  existingMedia?: Array<{
    _id: string;
    midiLink: string;
    midiTipo: string;
  }>;
  mediaToDelete?: string[];
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onRemoveExistingMedia?: (mediaId: string) => void;
}

export function Etapa2UploadImagens({
  validImages,
  existingMedia = [],
  mediaToDelete = [],
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveImage,
  onRemoveExistingMedia,
}: Etapa2UploadImagensProps) {
  const totalImages = existingMedia.length + validImages.length;
  
  return (
    <>
      {/* Step 2: Image Upload */}
      <div className="space-y-4" data-test="etapa2-container">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A202C] flex items-center gap-2">
              <svg className="w-6 h-6 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imagens do Evento
            </h2>
            <p className="text-sm text-[#718096] mt-1">
              Resolução mínima: <strong>1024x690 pixels</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
            <span className="text-sm font-semibold text-[#805AD5]">{totalImages}/6</span>
            <span className="text-xs text-[#6B46C1]">imagens</span>
          </div>
        </div>

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          data-test="drop-zone"
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? "border-[#805AD5] bg-purple-50 scale-[1.02]"
              : "border-[#E2E8F0] bg-gray-50 hover:border-[#805AD5] hover:bg-purple-50"
          }`}
        >
          <input
            data-test="file-input"
            id="fileUpload"
            type="file"
            multiple
            accept="image/*"
            onChange={onFileInputChange}
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className={`p-4 rounded-full mb-4 transition-all ${
              isDragging 
                ? "bg-[#805AD5] scale-110" 
                : "bg-purple-100"
            }`}>
              <svg
                className={`w-12 h-12 transition-colors ${
                  isDragging ? "text-white" : "text-[#805AD5]"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <span className="text-base text-[#2D3748] mb-2 font-semibold">
              {isDragging ? "Solte as imagens aqui!" : "Arraste e solte suas imagens"}
            </span>
            <span className="text-sm text-[#718096] mb-3">ou</span>
            <span className="px-6 py-2.5 bg-[#805AD5] hover:bg-[#6B46C1] text-white rounded-lg font-medium transition-colors shadow-sm" data-test="btn-selecionar-arquivos">
              Selecionar Arquivos
            </span>
            <span className="text-xs text-[#A0AEC0] mt-4">PNG, JPG, JPEG (máx. 6 imagens)</span>
          </label>
        </div>

        {(existingMedia.length > 0 || validImages.length > 0) && (
          <div className="space-y-4">
            {/* Mídias existentes no servidor */}
            {existingMedia.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Imagens Atuais ({existingMedia.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto scrollbar-thin">
                  {existingMedia.map((media) => {
                    const isMarkedForDeletion = mediaToDelete.includes(media._id);
                    
                    return (
                      <div 
                        key={media._id} 
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          isMarkedForDeletion 
                            ? 'border-red-500 bg-red-50 opacity-60' 
                            : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <img
                          src={media.midiLink}
                          alt="Mídia existente"
                          data-test="existing-image"
                          className={`w-full h-24 object-cover transition-all ${
                            isMarkedForDeletion ? 'grayscale' : ''
                          }`}
                        />
                        {onRemoveExistingMedia && (
                          <button
                            type="button"
                            onClick={() => onRemoveExistingMedia(media._id)}
                            data-test="btn-remove-existing-image"
                            className={`absolute top-2 right-2 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all font-bold shadow-md ${
                              isMarkedForDeletion
                                ? 'bg-yellow-500 hover:bg-yellow-600 opacity-100'
                                : 'bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100'
                            }`}
                            title={isMarkedForDeletion ? "Cancelar exclusão" : "Marcar para exclusão"}
                          >
                            {isMarkedForDeletion ? '↺' : '×'}
                          </button>
                        )}
                        <div className={`absolute bottom-0 left-0 right-0 text-white text-[10px] px-2 py-1 flex items-center gap-1 ${
                          isMarkedForDeletion ? 'bg-red-600/90' : 'bg-blue-600/80'
                        }`}>
                          {isMarkedForDeletion ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Será excluída
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Salva
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Novas imagens selecionadas */}
            {validImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novas Imagens ({validImages.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto scrollbar-thin">
                  {validImages.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover"
                        data-test="new-image"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 font-bold shadow-md"
                        title="Remover imagem"
                        data-test="btn-remove-new-image"
                      >
                        ×
                      </button>
                      <p className="text-xs text-[#718096] px-2 py-1 truncate bg-white/90">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
