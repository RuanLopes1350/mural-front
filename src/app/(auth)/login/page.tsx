"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import useLogin from "@/hooks/useLogin";

export default function LoginPage() {

  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (session?.user) {
      router.push("/meus_eventos");
    }
  }, [status, router]);
  
  const { login, isLoading } = useLogin();

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [remember, setRemember] = useState(true);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, senha, callbackUrl: "/meus_eventos", remember });
  };

  return (
    <div className="w-full max-w-md" data-test="login-container">
      <div className="bg-white rounded-lg shadow-xl pb-6 pl-6 pr-6 space-y-4" data-test="login-card">

        <img
          src="/ifro-events-icon.svg"
          alt="Ifro Events"
          className="mx-auto h-24 w-24"
          data-test="login-logo"
        />

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900" data-test="login-title">
            Entrar
          </h1>

          <p className="mt-2 text-sm text-gray-600" data-test="login-subtitle">
            Acesse sua conta para continuar
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} data-test="login-form">

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              data-test="input-email"
              className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       placeholder:text-gray-400 transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>

            <input
              id="password"
              type="password"
              data-test="input-senha"
              className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       placeholder:text-gray-400 transition-all"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            data-test="remember-section"
          >
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                data-test="checkbox-remember"
                className="cursor-pointer w-4 h-4 text-indigo-600 border-gray-300 rounded 
                         focus:ring-2 focus:ring-indigo-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />

              <label htmlFor="remember" className="cursor-pointer text-sm text-gray-700">
                Lembrar de mim
              </label>
            </div>

            <Link
              href="/recuperar_senha"
              data-test="link-recuperar"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            data-test="btn-entrar"
            disabled={isLoading}
            className={`cursor-pointer w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg 
                     ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-busy={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
