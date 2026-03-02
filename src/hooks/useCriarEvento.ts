"use client"

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  criarEventoSchema,
  step1Schema,
  step3Schema,
  type CriarEventoForm
} from "@/schema/criarEventoSchema";
import { fetchData } from "@/services/api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { calcularDuracaoPorImagem, calcularLoops } from "@/lib/calculadoraDuracao";

const STORAGE_KEY = "criar_evento_draft";
const STORAGE_STEP_KEY = "criar_evento_step";
const STORAGE_IMAGES_KEY = "criar-evento-images";
const STORAGE_IMAGES_DATA_KEY = "criar-evento-images-data";

const initialFormData: CriarEventoForm = {
  titulo: "",
  descricao: "",
  categoria: "",
  local: "",
  link: "",
  dataInicio: "",
  dataFim: "",
  tags: [],
  exibDia: [],
  exibManha: false,
  exibTarde: false,
  exibNoite: false,
  exibInicio: "",
  exibFim: "",
  cor: "",
  animacao: "",
};

interface UseCriarEventoParams {
  eventId?: string;
  isEditMode?: boolean;
}

// Helpers de localStorage
const getLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

const removeLocalStorage = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove ${key}`, e);
  }
};

// Helper para formatar datas
const formatDateForInput = (dateString: string, includeTime = true) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!includeTime) return `${year}-${month}-${day}`;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper para converter base64 para File
const base64ToFile = (data: string, name: string): File => {
  const byteString = atob(data.split(',')[1]);
  const mimeString = data.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return new File([blob], name, { type: mimeString });
};

export function useCriarEvento(params?: UseCriarEventoParams) {
  const eventId = params?.eventId;
  const isEditMode = params?.isEditMode || !!eventId;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<number>(() => {
    if (isEditMode) return 1;
    const stored = getLocalStorage(STORAGE_STEP_KEY);
    return stored ? parseInt(stored, 10) || 1 : 1;
  });

  const form = useForm<CriarEventoForm>({
    resolver: zodResolver(criarEventoSchema),
    defaultValues: (() => {
      if (isEditMode) return initialFormData;
      const stored = getLocalStorage(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return initialFormData;
        }
      }
      return initialFormData;
    })(),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  // As imagens não são mais restauradas do localStorage para evitar QuotaExceededError
  const [validImages, setValidImages] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<Array<{
    _id: string;
    midiLink: string;
    midiTipo: string;
  }>>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);

  const formValues = form.watch();

  // Salvar formulário no localStorage
  useEffect(() => {
    if (!isEditMode && typeof window !== "undefined") {
      setLocalStorage(STORAGE_KEY, JSON.stringify(formValues));
    }
  }, [formValues, isEditMode]);

  // Salvar step no localStorage
  useEffect(() => {
    if (!isEditMode) {
      setLocalStorage(STORAGE_STEP_KEY, step.toString());
    }
  }, [step, isEditMode]);

  // Nota: NÃO salvamos as imagens no localStorage porque são muito pesadas (causam QuotaExceededError)
  // As imagens ficam apenas em memória (validImages e blobUrls) durante a sessão
  // Se o usuário recarregar a página, precisará fazer upload novamente

  const clearStorage = useCallback(() => {
    try {
      blobUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch { } });
    } catch { }

    removeLocalStorage(STORAGE_KEY);
    removeLocalStorage(STORAGE_STEP_KEY);
    // Não precisamos mais limpar STORAGE_IMAGES_KEY e STORAGE_IMAGES_DATA_KEY pois não os usamos mais
  }, [blobUrls]);

  const loadEventData = useCallback((evento: any) => {
    const exibDia = typeof evento.exibDia === 'string'
      ? evento.exibDia.split(',').filter(Boolean)
      : Array.isArray(evento.exibDia) ? evento.exibDia : [];

    const formData: CriarEventoForm = {
      titulo: evento.titulo || "",
      descricao: evento.descricao || "",
      categoria: evento.categoria || "",
      local: evento.local || "",
      link: evento.link || "",
      dataInicio: formatDateForInput(evento.dataInicio),
      dataFim: formatDateForInput(evento.dataFim),
      tags: evento.tags || [],
      exibDia,
      exibManha: evento.exibManha || false,
      exibTarde: evento.exibTarde || false,
      exibNoite: evento.exibNoite || false,
      exibInicio: formatDateForInput(evento.exibInicio, false),
      exibFim: formatDateForInput(evento.exibFim, false),
      cor: evento.cor?.toString() || "",
      animacao: evento.animacao?.toString() || "",
    };

    form.reset(formData, {
      keepErrors: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });

    // Atualizar campos Select
    setTimeout(() => {
      ['categoria', 'cor', 'animacao'].forEach(field => {
        form.setValue(field as any, formData[field as keyof CriarEventoForm] as string, { shouldValidate: false });
        form.clearErrors(field as any);
      });
    }, 100);

    // Carregar mídias existentes
    if (evento.midia?.length > 0) {
      setExistingMedia(evento.midia.map((media: any) => ({
        _id: media._id,
        midiLink: media.midiLink,
        midiTipo: media.midiTipo,
      })));
      setValidImages([]);
      setBlobUrls([]);
    } else {
      setExistingMedia([]);
      setValidImages([]);
      setBlobUrls([]);
    }
  }, [form]);

  const resetForm = useCallback(() => {
    form.reset(initialFormData);
    setStep(1);
    setValidImages([]);
    // revoga e limpa blob urls
    try {
      blobUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch { } });
    } catch { }
    setBlobUrls([]);
    clearStorage();
  }, [form, clearStorage, blobUrls]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  };

  const handleFilesChange = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingExistingMedia = existingMedia.length - mediaToDelete.length;
    const currentCount = validImages.length + remainingExistingMedia;
    const remainingSlots = 6 - currentCount;

    if (remainingSlots <= 0) {
      toast.error("Limite máximo de 6 imagens atingido");
      return;
    }

    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (fileArray.length > remainingSlots) {
      toast.warning(`Apenas ${remainingSlots} imagem(ns) será(ão) adicionada(s) devido ao limite de 6`);
    }

    const valid: File[] = [];
    const invalid: string[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) {
        invalid.push(`${file.name} (tipo de arquivo não suportado)`);
        continue;
      }

      try {
        const dimensions = await getImageDimensions(file);
        if (dimensions.width >= 1024 && dimensions.height >= 690) {
          valid.push(file);
        } else {
          invalid.push(`${file.name} (${dimensions.width}x${dimensions.height} < 1024x690)`);
        }
      } catch {
        invalid.push(`${file.name} (erro ao ler dimensões)`);
      }
    }

    // cria object URLs para visualização imediata na sessão
    const newBlobUrls = valid.map(f => URL.createObjectURL(f));
    setBlobUrls((prev) => [...prev, ...newBlobUrls]);
    setValidImages((prev) => [...prev, ...valid]);

    if (invalid.length > 0) {
      toast.error(`Erro: As seguintes imagens não atendem à resolução mínima de 1024x690:\n${invalid.join("\n")}`);
    }
  }, [validImages.length, existingMedia.length, mediaToDelete.length]);

  const handleRemoveImage = useCallback((index: number) => {
    setValidImages((prev) => prev.filter((_, i) => i !== index));
    setBlobUrls((prev) => {
      const url = prev[index];
      try { if (url) URL.revokeObjectURL(url); } catch { }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleRemoveExistingMedia = useCallback((mediaId: string) => {
    if (!isEditMode) {
      return;
    }

    setMediaToDelete((prev) =>
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );

    const isMarked = !mediaToDelete.includes(mediaId);
    toast.info(
      isMarked
        ? "Mídia marcada para exclusão. Salve as alterações para confirmar."
        : "Exclusão cancelada.",
      { position: "top-right", autoClose: isMarked ? 3000 : 2000 }
    );
  }, [isEditMode, mediaToDelete]);

  const validateStep = useCallback(async (stepNumber: number) => {
    const currentValues = form.getValues();

    if (stepNumber === 1) {
      const step1Data = {
        titulo: currentValues.titulo,
        descricao: currentValues.descricao,
        categoria: currentValues.categoria,
        local: currentValues.local,
        dataInicio: currentValues.dataInicio,
        dataFim: currentValues.dataFim,
        link: currentValues.link,
        tags: currentValues.tags,
      };

      const result = step1Schema.safeParse(step1Data);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          form.setError(issue.path[0] as any, { message: issue.message });
        });
        toast.error("Complete todos os campos obrigatórios da Etapa 1");
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      const remainingExistingMedia = existingMedia.length - mediaToDelete.length;
      const totalImages = validImages.length + remainingExistingMedia;
      if (totalImages === 0) {
        toast.error("Adicione pelo menos 1 imagem antes de continuar");
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      const step3Data = {
        exibDia: currentValues.exibDia,
        exibManha: currentValues.exibManha,
        exibTarde: currentValues.exibTarde,
        exibNoite: currentValues.exibNoite,
        exibInicio: currentValues.exibInicio,
        exibFim: currentValues.exibFim,
        cor: currentValues.cor,
        animacao: currentValues.animacao,
      };

      const result = step3Schema.safeParse(step3Data);

      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => issue.message).join(", ");
        toast.error(`Complete todos os campos obrigatórios: ${errorMessages}`);
        return false;
      }
      return true;
    }

    return true;
  }, [form, validImages.length, existingMedia.length, mediaToDelete.length]);

  const criarEventoMutation = useMutation({
    mutationFn: async (data: CriarEventoForm) => {
      // Calcula a quantidade total de imagens que o evento terá
      // (novas imagens + imagens existentes - imagens marcadas para deletar)
      const quantidadeImagensNovas = validImages.length;
      const quantidadeImagensExistentes = existingMedia.length;
      const quantidadeImagensParaDeletar = mediaToDelete.length;
      const totalImagens = quantidadeImagensNovas + quantidadeImagensExistentes - quantidadeImagensParaDeletar;

      // Calcula automaticamente a duração e loops baseado na quantidade de imagens
      const duracaoCalculada = calcularDuracaoPorImagem(totalImagens);
      const loopsCalculados = calcularLoops();

      console.log('Calculando duracao e loops:', {
        quantidadeImagensNovas,
        quantidadeImagensExistentes,
        quantidadeImagensParaDeletar,
        totalImagens,
        duracaoCalculada,
        loopsCalculados
      });

      const payload = {
        ...data,
        exibDia: data.exibDia.join(","),
        cor: parseInt(data.cor, 10),
        animacao: parseInt(data.animacao, 10),
        duracao: duracaoCalculada,  // Adiciona a duração calculada
        loops: loopsCalculados,      // Adiciona os loops calculados (sempre 3)
        ...(!isEditMode && { status: 1 }),
      };

      console.log('Payload enviado para API:', payload);

      const endpoint = isEditMode ? `/eventos/${eventId}` : "/eventos";
      const method = isEditMode ? "PATCH" : "POST";

      return await fetchData<{
        error: boolean;
        code: number;
        message: string;
        data: { _id: string;[key: string]: any };
      }>(endpoint, method, session?.user?.accesstoken, payload);
    },
    onSuccess: async (eventoResponse) => {
      const eventoIdToUse = eventId || eventoResponse.data._id;

      if (!eventoIdToUse) {
        throw new Error("ID do evento não encontrado");
      }

      if (isEditMode && mediaToDelete.length > 0) {
        await deletarMidiasMutation.mutateAsync(eventoIdToUse);
      }

      if (validImages.length > 0) {
        await uploadImagensMutation.mutateAsync(eventoIdToUse);
      } else {
        toast.success(
          isEditMode ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!",
          { position: "top-right", autoClose: 3000 }
        );
      }

      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      queryClient.invalidateQueries({ queryKey: ["evento", eventId] });

      clearStorage();
      form.reset(initialFormData);
      setStep(1);
      setValidImages([]);
      setBlobUrls([]);
      setExistingMedia([]);
      setMediaToDelete([]);
    },
    onError: (error: any) => {
      console.error("Erro ao salvar evento:", error);
      toast.error(
        error?.message || (isEditMode ? "Erro ao atualizar evento" : "Erro ao criar evento"),
        { position: "top-right", autoClose: 3000 }
      );
    },
  });

  const deletarMidiasMutation = useMutation({
    mutationFn: async (eventoIdToUse: string) => {
      const results = await Promise.all(
        mediaToDelete.map(async (midiaId) => {
          try {
            await fetchData(
              `/eventos/${eventoIdToUse}/midia/${midiaId}`,
              "DELETE",
              session?.user?.accesstoken
            );
            return { success: true, midiaId };
          } catch (error: any) {
            console.error(`Erro ao deletar mídia ${midiaId}:`, error);
            return { success: false, midiaId, error };
          }
        })
      );

      return {
        successCount: results.filter(r => r.success).length,
        failCount: results.filter(r => !r.success).length,
        results
      };
    },
    onSuccess: (data) => {
      if (data.successCount > 0) {
        toast.success(`${data.successCount} mídia(s) removida(s) com sucesso!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      if (data.failCount > 0) {
        toast.warning(`${data.failCount} mídia(s) não puderam ser removidas.`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    },
    onError: (error: any) => {
      console.error("Erro ao deletar mídias:", error);
      toast.error("Erro ao deletar mídias", {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  const uploadImagensMutation = useMutation({
    mutationFn: async (eventoIdToUse: string) => {
      const formData = new FormData();
      validImages.forEach((file) => formData.append("files", file));

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const uploadResponse = await fetch(
        `${API_URL}/eventos/${eventoIdToUse}/midias`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.user?.accesstoken}` },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData?.message || "Erro ao fazer upload das imagens");
      }

      return uploadResponse.json();
    },
    onSuccess: () => {
      toast.success(
        isEditMode ? "Evento e imagens atualizados com sucesso!" : "Evento e imagens criados com sucesso!",
        { position: "top-right", autoClose: 3000 }
      );
    },
    onError: (error: any) => {
      console.error("Erro ao fazer upload das imagens:", error);
      toast.error(error?.message || "Erro ao fazer upload das imagens", {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  const submit = useCallback(async (data: CriarEventoForm) => {
    try {
      await criarEventoMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }, [criarEventoMutation]);

  return {
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
    loading: criarEventoMutation.isPending || uploadImagensMutation.isPending || deletarMidiasMutation.isPending,
    clearStorage,
    resetForm,
    loadEventData,
    isEditMode,
  } as const;
}