import { useState, useCallback } from "react";

// Função auxiliar para converter URL (blob ou http) para Base64
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    if (url.startsWith('data:')) {
      return url;
    }

    // Para blob URLs
    if (url.startsWith('blob:')) {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Para URLs http/https 
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Falha ao converter imagem para base64:', url, error);
    return url;
  }
};

export function usePreviewWindow() {
  const [previewWindow, setPreviewWindow] = useState<Window | null>(null);

  const openPreview = useCallback(async (imageUrls?: string[]) => {
    // Converte todas as imagens para Base64 antes de salvar
    if (imageUrls && imageUrls.length > 0) {
      try {
        const base64Images = await Promise.all(
          imageUrls.map(url => urlToBase64(url))
        );
        localStorage.setItem('preview-evento-blobs', JSON.stringify(base64Images));
      } catch (error) {
        console.error('Erro ao converter imagens para base64:', error);
        localStorage.setItem('preview-evento-blobs', JSON.stringify(imageUrls));
      }
    } else {
      localStorage.removeItem('preview-evento-blobs');
    }

    // Verifica se a janela já existe e está aberta
    if (previewWindow && !previewWindow.closed) {
      // Se existe, apenas foca nela e força reload
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
