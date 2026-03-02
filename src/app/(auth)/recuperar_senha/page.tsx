"use client"

import Link from "next/link";
import { fetchData } from "@/services/api";
import { useState } from "react";
import { toast } from "react-toastify";

interface Errors {
    message: string
}

interface RecoverResponse {
    error: string,
    code: string,
    message: string,
    data: {
        message: string
    }
    errors: Errors[] | null
}

export default function RecuperarSenhaPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("📧 [Recuperar Senha] Iniciando processo de recuperação");

        if (!email) {
            toast.error("Por favor, informe seu e-mail");
            return;
        }

        setIsLoading(true);
        setError('');

        try {

            const response = await fetchData<RecoverResponse>(
                "/recover",
                "POST",
                null,
                { email }
            );

            toast.success(
                response.data?.message ||
                response.message ||
                "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
            );

            setEmail('');
        } catch (error: any) {

            // Trata diferentes tipos de erro
            let mensagem = "Erro ao enviar e-mail de recuperação";

            if (error.status === 0) {
                mensagem = "Erro de conexão com o servidor. Verifique sua internet.";
            } else if (error.message) {
                mensagem = error.message;
            } else if (error.data?.message) {
                mensagem = error.data.message;
            } else if (error.errors && error.errors.length > 0) {
                mensagem = error.errors[0].message;
            }
            setError(mensagem);
            toast.error(mensagem);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md" data-test="recover-container">
            <div className="bg-white rounded-lg shadow-xl pt-4 pb-6 pl-6 pr-6 space-y-4" data-test="recover-card">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    data-test="recover-back"
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
                    <span>Voltar para login</span>
                </Link>
                <img src="/ifro-events-icon.svg" alt="Ifro Events" className="mx-auto h-24 w-24" draggable='false' />

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900" data-test="recover-title">Recuperar Senha</h1>
                    <p className="mt-3 text-sm text-gray-600">
                        Enviaremos um link de verificação para o seu e-mail para redefinir sua senha.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            data-test="input-email-recover"
                            className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     placeholder:text-gray-400 transition-all"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            <p className="font-medium">Erro:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        data-test="btn-enviar-recover"
                        className={`w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium
                                 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg
                                 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Enviando...' : 'Pedir Link de Recuperação'}
                    </button>
                </form>
            </div>
        </div>
    );
}