"use client"

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6",
        className
      )}
      data-teste="login-form-container"
      {...props}
    >

      {/* Card */}
      <Card className="w-[550px] shadow-2xl bg-white dark:bg-gray-400 rounded-2xl" data-teste="login-card">
        <CardHeader className="text-center pt-12 pb-">
          <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">

            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <img
                src="/ifro-events-icon.svg"
                alt="IFRO EVENTS"
                className="w-3000 h-45"
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-14">
          <form className="flex flex-col gap-10">

            {/* E-mail */}
            <div className="flex flex-col gap-4">
              <Label
                htmlFor="email"
                className="text-2xl font-medium text-gray-700 dark:text-gray-200"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="!text-2xl py-5 rounded-lg border-2 border-gray-300 dark:border-gray-700 focus:ring-indigo-500 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400"
                data-test="input-email-form"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-2 relative">
              <Label
                htmlFor="password"
                className="text-2xl font-medium text-gray-700 dark:text-gray-200"
              >
                Senha
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Digite sua senha"
                className="!text-2xl py-5 rounded-lg border-2 border-gray-300 dark:border-gray-700 focus:ring-indigo-500 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 pr-20"
                data-test="input-senha-form"
              />
              {/* Botão ver/ocultar */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg"
                data-test="btn-toggle-senha"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>

              {/* Esqueceu a senha */}
              <a
                href="#"
                className="self-end text-blue-600 dark:text-blue-400 hover:underline text-xl mt-2"
                data-test="link-esqueceu-senha"
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-5 mt-2">
              <input
                id="remember"
                type="checkbox"
                className="h-7 w-7 rounded border-gray-300 dark:border-gray-600 dark:checked:bg-indigo-600 focus:ring-indigo-500"
                data-test="checkbox-lembrar"
              />
              <Label
                htmlFor="remember"
                className="text-xl text-gray-700 dark:text-gray-200"
              >
                Lembrar-me
              </Label>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 py-7 text-3xl rounded-lg mt-10"
              data-test="btn-entrar-form"
            >
              Entrar
            </Button>

            {/* Rodapé */}
            <div className="text-center text-xl text-gray-700 dark:text-gray-200 mt-10">
              Não tem uma conta?{" "}
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                data-test="link-criar-conta"
              >
                Criar conta
              </a>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
