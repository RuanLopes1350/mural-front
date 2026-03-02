import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/services/api";
import { EventosTotemApiResponse } from "@/types/eventos";

export function useEventosTotem() {
  const {
    data: eventosData,
    isLoading: eventosIsLoading,
    isError: eventosIsError,
    error: eventosError,
  } = useQuery<EventosTotemApiResponse, Error>({
    queryKey: ["eventos-totem"],
    queryFn: async () => {
      // Chama a rota específica do totem
      return fetchData<EventosTotemApiResponse>(
        "/totem/eventos",
        "GET"
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Atualiza automaticamente a cada 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    data: eventosData?.data || [],
    isLoading: eventosIsLoading,
    isError: eventosIsError,
    error: eventosError,
  };
}