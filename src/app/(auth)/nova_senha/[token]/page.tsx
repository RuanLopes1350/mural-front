"use client";

import Link from "next/link";
import { fetchData } from "@/services/api";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Errors {
    message: string;
}

interface ResetPasswordResponse {
    error: string;
    code: string;
    message: string;
    data: {
        message: string;
    };
    errors: Errors[] | null;
}

interface PageProps {
    params: Promise<{
        token: string;
    }>;
}

export default function NovaSenhaPage({ params }: PageProps) {
    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const getToken = async () => {
            const resolvedParams = await params;
            setToken(resolvedParams.token);
        };
        getToken();
    }, [params]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!novaSenha || !confirmarSenha) {
            toast.error("Por favor, preencha todos os campos");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.error("As senhas não coincidem");
            return;
        }

        if (novaSenha.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
            return;
        }

        if (!token) {
            toast.error("Token inválido ou expirado");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetchData<ResetPasswordResponse>(
                `/password/reset/token?token=${token}`,
                "PATCH",
                null,
                { senha: novaSenha }
            );

            toast.success(
                response.data?.message ||
                response.message ||
                "Senha redefinida com sucesso!"
            );

            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (error: any) {
            let mensagem = "Erro ao redefinir senha";

            if (error.status === 0) {
                mensagem = "Erro de conexão com o servidor.";
            } else if (error.status === 400 || error.status === 401) {
                mensagem = "Token inválido ou expirado.";
            } else if (error.message) {
                mensagem = error.message;
            } else if (error.data?.message) {
                mensagem = error.data.message;
            } else if (error.errors?.length > 0) {
                mensagem = error.errors[0].message;
            }

            setError(mensagem);
            toast.error(mensagem);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md" data-test="reset-container">
            <div className="bg-white rounded-lg shadow-xl p-6 space-y-4" data-test="reset-card">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    data-test="reset-back"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>Voltar</span>
                </Link>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900" data-test="reset-title">
                        Definir Nova Senha
                    </h1>
                    <p className="mt-3 text-sm text-gray-600" data-test="reset-subtitle">
                        Escolha uma senha forte
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} data-test="reset-form">
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Nova Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            data-test="input-password"
                            className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg"
                            placeholder="••••••••"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            disabled={isLoading}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirmar Senha
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            data-test="input-confirm"
                            className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg"
                            placeholder="••••••••"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            disabled={isLoading}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            data-test="reset-error"
                        >
                            <p className="font-medium">Erro:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!token && (
                        <div
                            className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm"
                            data-test="reset-loading-token"
                        >
                            Carregando token...
                        </div>
                    )}

                    <button
                        type="submit"
                        data-test="btn-reset"
                        disabled={isLoading || !token}
                        className={`w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium`}
                    >
                        {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                    </button>
                </form>
            </div>
        </div>
    );
}
