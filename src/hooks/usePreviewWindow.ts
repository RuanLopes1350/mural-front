import { useState, useCallback } from "react";

export function usePreviewWindow() {
  const [previewWindow, setPreviewWindow] = useState<Window | null>(null);

  const openPreview = useCallback(async (imageUrls?: string[]) => {
    const STORAGE_KEY = 'preview-evento-blobs';

    // Salva as URLs das imagens
    if (imageUrls && imageUrls.length > 0) {
      try {
        // Armazenamos apenas as URLs. 
        // Nota: Blob URLs (blob:http://...) funcionam entre janelas da mesma origem.
        // Convertê-las para Base64 era o que causava o estouro de cota (5MB limit).
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(imageUrls));
      } catch (error) {
        console.error('Erro ao salvar URLs de preview no sessionStorage:', error);
        
        // Se ainda assim der erro de cota, tentamos limpar e salvar o mínimo
        try {
          sessionStorage.clear();
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(imageUrls));
        } catch (retryError) {
          console.error('Falha crítica de armazenamento:', retryError);
          alert('O navegador atingiu o limite de memória para o preview. Tente usar menos imagens ou imagens menores.');
        }
      }
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    // Verifica se a janela já existe e está aberta
    if (previewWindow && !previewWindow.closed) {
      // Se existe, apenas foca nela e força reload para ler o novo storage
      previewWindow.focus();
      previewWindow.location.reload();
    } else {
      // Se não existe ou foi fechada, abre uma nova
      const newWindow = window.open('/preview-evento', 'evento-preview');
      if (newWindow) {
        setPreviewWindow(newWindow);
        newWindow.focus();
      }
    }
  }, [previewWindow]);

  const closePreview = useCallback(() => {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }
    setPreviewWindow(null);
  }, [previewWindow]);

  return {
    previewWindow,
    openPreview,
    closePreview,
  };
}
