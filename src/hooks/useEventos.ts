import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/services/api";
import { EventosApiResponse } from "@/types/eventos";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface UseEventosParams {
  page: number;
  limit: number;
  enabled?: boolean;
  filters?: {
    search?: string;
    status?: string;
    category?: string;
  };
}

export function useEventos({ page, limit, enabled = true, filters }: UseEventosParams) {
  const { data: session } = useSession()

  const {
    data: eventosData,
    isLoading: eventosIsLoading,
    isError: eventosIsError,
    error: eventosError,
  } = useQuery<EventosApiResponse, Error>({
    queryKey: ["eventos", page, limit, filters],
    queryFn: async () => {
      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        limite: limit.toString(),
        ordenarPor: "-createdAt",
      });

      // Adicionar filtros se existirem
      if (filters?.search && filters.search.trim() !== "") {
        params.append("titulo", filters.search.trim());
      }
      if (filters?.status && filters.status !== "all") {
        const statusValue = filters.status === "active" ? "1" : "0";
        params.append("status", statusValue);
      }
      if (filters?.category && filters.category !== "all") {
        params.append("categoria", filters.category);
      }

      if (session?.user?.admin === true) {
        return fetchData<EventosApiResponse>(`/eventos/admin/?${params.toString()}`, "GET");
      } else {
        return fetchData<EventosApiResponse>(`/eventos/?${params.toString()}`, "GET");
      }

    },

    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    data: eventosData,
    isLoading: eventosIsLoading,
    isError: eventosIsError,
    error: eventosError,
  };
}

export function useToggleEventStatus() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: toggleStatusMutate,
    isPending: toggleStatusIsPending,
    isError: toggleStatusIsError,
    error: toggleStatusError,
  } = useMutation({
    mutationFn: async ({ eventId, newStatus }: { eventId: string; newStatus: number }) => {

      return fetchData(`/eventos/${eventId}`, "PATCH", undefined, { status: newStatus });
    },
    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ["eventos"] });

      const statusText = variables.newStatus === 1 ? "ativado" : "desativado";
      toast.success(`Evento ${statusText} com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error) => {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do evento. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  return {
    toggleStatus: toggleStatusMutate,
    isPending: toggleStatusIsPending,
    isError: toggleStatusIsError,
    error: toggleStatusError,
  };
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const {
    mutateAsync: deleteEventMutate,
    isPending: deleteEventIsPending,
    isError: deleteEventIsError,
    error: deleteEventError,
  } = useMutation({
    mutationFn: async (eventId: string) => {
      return fetchData(`/eventos/${eventId}`, "DELETE");
    },
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      // Notificação de sucesso
      toast.success("Evento excluído com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });

  return {
    deleteEvent: deleteEventMutate,
    isPending: deleteEventIsPending,
    isError: deleteEventIsError,
    error: deleteEventError,
  };
}

// Hook para buscar um evento específico
export function useEvento(eventId: string) {
  const { data: session } = useSession();

  return useQuery<any, Error>({
    queryKey: ["evento", eventId],
    queryFn: async () => {
      return fetchData(`/eventos/${eventId}`, "GET", session?.user?.accesstoken);
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
