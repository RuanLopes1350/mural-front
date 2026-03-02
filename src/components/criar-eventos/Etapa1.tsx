"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CriarEventoForm } from "@/schema/criarEventoSchema";

interface Etapa1InformacoesBasicasProps {
  form: UseFormReturn<CriarEventoForm>;
}

export function Etapa1InformacoesBasicas({ form }: Etapa1InformacoesBasicasProps) {
  const [tagInput, setTagInput] = useState("");

  return (
    <>
      {/* Step 1: Basic Information */}
      <div className="space-y-6" data-test="etapa1-container">
        <div>
          <h2 className="text-xl font-bold text-[#1A202C] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informações Básicas
          </h2>
          <p className="text-sm text-[#718096] mt-1">
            Preencha os dados principais do evento
          </p>
        </div>

        {/* Título */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#2D3748]">
                Nome do Evento
              </FormLabel>
              <FormControl>
                <Input
                  data-test="input-titulo"
                  placeholder="Ex: Workshop de Desenvolvimento Web"
                  {...field}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#2D3748]">
                Descrição
              </FormLabel>
              <FormControl>
                <div>
                  <Textarea
                    data-test="input-descricao"
                    placeholder="Conte mais sobre o evento, incluindo objetivos, conteúdo e público-alvo..."
                    {...field}
                    maxLength={640}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all resize-none"
                    rows={5}
                  />
                  <div className="text-xs text-[#718096] mt-2 text-right">
                    {(field.value?.length ?? 0)} / 640 caracteres
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categoria */}
          <FormField
            control={form.control}
            name="categoria"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748]">
                  Categoria
                </FormLabel>
                <Select
                  onValueChange={(value: string) => {
                    field.onChange(value);
                    // Revalida o campo após mudança
                    setTimeout(() => form.trigger("categoria"), 0);
                  }}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all bg-white" data-test="select-categoria">
                      <SelectValue placeholder="Escolha o tipo do evento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#CBD5E0] rounded-lg shadow-lg">
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="empreendedorismo - Inovacao">
                      Empreendedorismo & Inovação
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="artistico - Cultural">
                      Artistico & Cultural
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="cientifico - Tecnologico">
                      Científico & Tecnológico
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="desportivos">
                      Desportivos
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="palestra">
                      Palestra
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="workshops">
                      Workshops
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="atividades - Sociais">
                      Atividades Sociais
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="gestao - Pessoas">
                      Gestão De Pessoas
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer" value="outro">
                      Outro
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Local */}
          <FormField
            control={form.control}
            name="local"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748]">
                  Local
                </FormLabel>
                <FormControl>
                  <Input
                    data-test="input-local"
                    placeholder="Ex: Auditório Principal - Bloco A"
                    {...field}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data de Início */}
          <FormField
            control={form.control}
            name="dataInicio"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Data e Hora de Início
                </FormLabel>
                <FormControl>
                  <Input
                    data-test="input-data-inicio"
                    type="datetime-local"
                    {...field}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Fim */}
          <FormField
            control={form.control}
            name="dataFim"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Data e Hora de Término
                </FormLabel>
                <FormControl>
                  <Input
                    data-test="input-data-fim"
                    type="datetime-local"
                    {...field}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Link */}
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Link QR Code <span className="text-xs font-normal text-[#718096]">(Opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  data-test="input-link"
                  type="url"
                  placeholder="https://seu-site.com/inscricoes"
                  {...field}
                  value={field.value || ""}
                  className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                />
              </FormControl>
              <p className="text-xs text-[#718096] mt-1">Este link será convertido em QR Code no totem</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => {
            const handleAddTag = () => {
              if (tagInput.trim() && !field.value?.includes(tagInput.trim())) {
                field.onChange([...(field.value ?? []), tagInput.trim()]);
                setTagInput("");
                setTimeout(() => form.trigger("tags"), 0);
              }
            };

            const handleRemoveTag = (index: number) => {
              field.onChange((field.value ?? []).filter((_: string, i: number) => i !== index));
              setTimeout(() => form.trigger("tags"), 0);
            };

            return (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    data-test="input-tag"
                    type="text"
                    placeholder="Ex: tecnologia, workshop, programação..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    data-test="btn-adicionar-tag"
                    className="px-6 py-3 bg-[#805AD5] hover:bg-[#6B46C1] text-white rounded-lg transition-colors font-medium shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {field.value?.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-[#553C9A] px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="text-[#553C9A] hover:text-[#44337A] font-bold text-lg"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#718096] mt-1">Pressione Enter ou clique no botão + para adicionar</p>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </>
  );
}
