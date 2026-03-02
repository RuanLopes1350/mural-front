"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface LoginParams {
  email: string;
  senha: string;
  callbackUrl?: string;
  remember?: boolean;
}

export default function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login({ email, senha, callbackUrl = "/meus_eventos" }: LoginParams) {
    // if remember is not provided, default to false
    const rememberFlag = (arguments[0] as any)?.remember ?? false;
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Login realizado com sucesso", { autoClose: 1000 });
        try {
          if (rememberFlag) {
            document.cookie = `remember_me=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=strict`;
          } else {
            // marca que o login atual deve durar apenas até fechar a aba/janela
            sessionStorage.setItem("keep_until_close", "1");
            // também removemos qualquer cookie persistente anterior
            document.cookie = `remember_me=; path=/; max-age=0`;
          }
        } catch (e) {
        }
        // navegar para a rota desejada
        router.push(callbackUrl);
        return { ok: true };
      }

      const resAny = res as any;
      let message = resAny?.error || "Erro ao efetuar login";

      // Se a API / fluxo do auth retornar status 201, consideramos credenciais inválidas
      if (typeof resAny?.status === "number" && resAny.status === 401) {
        message = "Credenciais inválidas";
      }
      
      if (typeof message === "string" && message.startsWith("Error:")) {
        message = message.replace(/^Error:\s*/i, "");
      }

      setError(message);
      toast.error(message);
      return { ok: false, error: message };
    } catch (err: any) {
      const message = err?.message || "Erro ao efetuar login";
      setError(message);
      toast.error(message);
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    login,
    isLoading,
    error,
  };
}
