"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { fetchData } from "@/services/api";

interface Usuario {
  _id: string;
  email: string;
}

interface CompartilharPermissoesProps {
  eventId: string;
  usuariosCompartilhados: Usuario[];
  onUsuarioAdicionado: (usuario: Usuario) => void;
  onUsuarioRemovido: (usuarioId: string) => void;
  accessToken?: string;
  userEmail?: string;
}

export function CompartilharPermissoes({
  eventId,
  usuariosCompartilhados,
  onUsuarioAdicionado,
  onUsuarioRemovido,
  accessToken,
  userEmail,
}: CompartilharPermissoesProps) {
  const [email, setEmail] = useState("");

  // Mutation para adicionar usuário
  const adicionarUsuarioMutation = useMutation({
    mutationFn: async (emailToAdd: string) => {
      try {
        return await fetchData<{ data?: { userId?: string } }>(
          `/eventos/${eventId}/compartilhar`,
          "POST",
          accessToken,
          { email: emailToAdd }
        );
      } catch (error: any) {
        // Captura o erro e lança com a mensagem formatada
        throw new Error(error?.message || "Usuário não encontrado");
      }
    },
    onSuccess: (data, emailToAdd) => {
      onUsuarioAdicionado({ _id: data.data?.userId || emailToAdd, email: emailToAdd });
      setEmail("");
      toast.success("Permissão compartilhada com sucesso!");
    },
    onError: (error: any) => {
      // Apenas exibe o toast, sem relançar o erro
      toast.error(error?.message || "Erro ao compartilhar evento");
    },
  });

  // Mutation para remover usuário
  const removerUsuarioMutation = useMutation({
    mutationFn: async (usuarioId: string) => {
      try {
        return await fetchData(
          `/eventos/${eventId}/compartilhar/${usuarioId}`,
          "DELETE",
          accessToken
        );
      } catch (error: any) {
        throw new Error(error?.message || "Erro ao remover permissão");
      }
    },
    onSuccess: (_, usuarioId) => {
      onUsuarioRemovido(usuarioId);
      toast.success("Permissão removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao remover permissão");
    },
  });

  const isLoading = adicionarUsuarioMutation.isPending || removerUsuarioMutation.isPending;

  const handleAdicionarUsuario = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Por favor, informe um e-mail");
      return;
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, informe um e-mail válido");
      return;
    }

    // Verifica se está tentando compartilhar consigo mesmo
    if (userEmail && email.toLowerCase() === userEmail.toLowerCase()) {
      toast.error("Você não pode compartilhar o evento consigo mesmo");
      return;
    }

    // Verifica se o usuário já foi adicionado
    if (usuariosCompartilhados.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast.warning("Este usuário já tem permissão para editar o evento");
      return;
    }

    adicionarUsuarioMutation.mutate(email);
  };

  const handleRemoverUsuario = async (usuarioId: string, usuarioEmail: string) => {
    if (!window.confirm(`Deseja realmente remover a permissão de ${usuarioEmail}?`)) {
      return;
    }

    removerUsuarioMutation.mutate(usuarioId);
  };

  return (
    <div className="space-y-4" data-test="compartilhar-permissoes">
      <div>
        <Label className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartilhar Evento
        </Label>
        <p className="text-xs text-[#718096] mt-1">
          Adicione usuários que poderão editar este evento
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          id="compartilhar-email"
          data-test="input-compartilhar-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdicionarUsuario();
            }
          }}
          placeholder="usuario@exemplo.com"
          disabled={isLoading}
          className="flex-1 border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
        />
        <Button
          type="button"
          onClick={() => handleAdicionarUsuario()}
          disabled={isLoading || !email.trim()}
          data-test="btn-adicionar-usuario"
          className="px-6 py-3 bg-[#805AD5] hover:bg-[#6B46C1] text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3" data-test="lista-usuarios-compartilhados">
        {usuariosCompartilhados.map((usuario) => (
          <span
            key={usuario._id}
            data-test={`usuario-compartilhado-${usuario._id}`}
            className="bg-purple-100 text-[#553C9A] px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {usuario.email}
            <button
              type="button"
              onClick={() => handleRemoverUsuario(usuario._id, usuario.email)}
              disabled={isLoading}
              data-test={`btn-remover-usuario-${usuario._id}`}
              className="text-[#553C9A] hover:text-[#44337A] font-bold text-lg disabled:opacity-50"
              title="Remover permissão"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <p className="text-xs text-[#718096] mt-1">
        Pressione Enter ou clique no botão + para adicionar
      </p>
    </div>
  );
}
