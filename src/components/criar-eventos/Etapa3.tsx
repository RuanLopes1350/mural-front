"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
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

interface Etapa3ConfiguracoesExibicaoProps {
  form: UseFormReturn<CriarEventoForm>;
  onAnimacaoPreview: (preview: { nome: string; classe: string } | null) => void;
  onAnimacaoKeyChange: () => void;
}

export function Etapa3ConfiguracoesExibicao({ 
  form, 
  onAnimacaoPreview, 
  onAnimacaoKeyChange 
}: Etapa3ConfiguracoesExibicaoProps) {
  return (
    <>
      {/* Step 3: Display Settings */}
      <div className="space-y-6" data-test="etapa3-container">
        <div>
          <h2 className="text-xl font-bold text-[#1A202C] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Configurações de Exibição no Totem
          </h2>
          <p className="text-sm text-[#718096] mt-1">
            Defina quando e como o evento será apresentado
          </p>
        </div>

        {/* Dias da Semana */}
        <FormField
          control={form.control}
          name="exibDia"
          render={({ field }) => {
            const diasDaSemana = [
              { value: "domingo", label: "Domingo" },
              { value: "segunda", label: "Segunda-feira" },
              { value: "terca", label: "Terça-feira" },
              { value: "quarta", label: "Quarta-feira" },
              { value: "quinta", label: "Quinta-feira" },
              { value: "sexta", label: "Sexta-feira" },
              { value: "sabado", label: "Sábado" },
            ];
            
            const todosDias = diasDaSemana.map(d => d.value);
            const todosSelecionados = todosDias.every(dia => (field.value || []).includes(dia));
            
            const handleToggle = (dia: string) => {
              const currentDias = field.value || [];
              const newDias = currentDias.includes(dia)
                ? currentDias.filter((d: string) => d !== dia)
                : [...currentDias, dia];
              field.onChange(newDias);
            };
            
            const handleToggleTodos = () => {
              if (todosSelecionados) {
                field.onChange([]);
              } else {
                field.onChange(todosDias);
              }
            };
            
            return (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dias da Semana
                </FormLabel>
                <div className="space-y-3 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-purple-50 rounded-lg border border-[#E2E8F0] hover:border-[#805AD5] transition-all">
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={handleToggleTodos}
                      className="h-4 w-4 text-[#805AD5] focus:ring-[#805AD5] border-gray-300 rounded accent-[#805AD5]"
                      data-test="checkbox-todos-dias"
                    />
                    <span className="text-sm font-medium text-[#805AD5]">Todos os dias da semana</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {diasDaSemana.map((dia) => (
                      <label key={dia.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:border-[#805AD5] transition-all">
                        <input
                          type="checkbox"
                          checked={(field.value || []).includes(dia.value)}
                          onChange={() => handleToggle(dia.value)}
                          className="h-4 w-4 text-[#805AD5] focus:ring-[#805AD5] border-gray-300 rounded accent-[#805AD5]"
                          data-test={`checkbox-dia-${dia.value}`}
                        />
                        <span className="text-sm text-[#2D3748]">{dia.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Período de Exibição */}
        <div className="space-y-2">
          <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Período do Dia
          </FormLabel>
          <div className="space-y-3 mt-2">
            {/* Opção Todos os Períodos */}
            <label 
              className="flex items-center gap-3 cursor-pointer p-3 bg-purple-50 rounded-lg border border-[#E2E8F0] hover:border-[#805AD5] transition-all"
              onClick={(e) => {
                e.preventDefault();
                const manha = form.getValues("exibManha");
                const tarde = form.getValues("exibTarde");
                const noite = form.getValues("exibNoite");
                const todosSelecionados = manha && tarde && noite;
                
                form.setValue("exibManha", !todosSelecionados);
                form.setValue("exibTarde", !todosSelecionados);
                form.setValue("exibNoite", !todosSelecionados);
              }}
            >
              <input
                type="checkbox"
                checked={
                  form.watch("exibManha") && 
                  form.watch("exibTarde") && 
                  form.watch("exibNoite")
                }
                readOnly
                className="h-4 w-4 text-[#805AD5] focus:ring-[#805AD5] border-gray-300 rounded accent-[#805AD5] pointer-events-none"
                data-test="checkbox-todos-periodos"
              />
              <span className="text-sm font-medium text-[#805AD5]">Todos os períodos</span>
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="exibManha"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex flex-col items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-[#805AD5] transition-all" data-test="checkbox-periodo-manha">
                      <FormControl>
                        <input
                          type="checkbox"
                          name="exibManha"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-[#805AD5] border-gray-300 rounded focus:ring-[#805AD5] accent-[#805AD5]"
                          data-test="checkbox-manha"
                        />
                      </FormControl>
                      <div className="text-center">
                        <FormLabel className="text-sm text-[#2D3748] cursor-pointer font-medium block">
                          Manhã
                        </FormLabel>
                        <span className="text-xs text-[#718096]">06:00 - 12:00</span>
                      </div>
                    </label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exibTarde"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex flex-col items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-[#805AD5] transition-all" data-test="checkbox-periodo-tarde">
                      <FormControl>
                        <input
                          type="checkbox"
                          name="exibTarde"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-[#805AD5] border-gray-300 rounded focus:ring-[#805AD5] accent-[#805AD5]"
                          data-test="checkbox-tarde"
                        />
                      </FormControl>
                      <div className="text-center">
                        <FormLabel className="text-sm text-[#2D3748] cursor-pointer font-medium block">
                          Tarde
                        </FormLabel>
                        <span className="text-xs text-[#718096]">12:01 - 18:00</span>
                      </div>
                    </label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exibNoite"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex flex-col items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-[#805AD5] transition-all" data-test="checkbox-periodo-noite">
                      <FormControl>
                        <input
                          type="checkbox"
                          name="exibNoite"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-[#805AD5] border-gray-300 rounded focus:ring-[#805AD5] accent-[#805AD5]"
                          data-test="checkbox-noite"
                        />
                      </FormControl>
                      <div className="text-center">
                        <FormLabel className="text-sm text-[#2D3748] cursor-pointer font-medium block">
                          Noite
                        </FormLabel>
                        <span className="text-xs text-[#718096]">18:01 em diante</span>
                      </div>
                    </label>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Início da Exibição */}
          <FormField
            control={form.control}
            name="exibInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Início da Exibição
                </FormLabel>
                <FormControl>
                  <Input
                    data-test="input-exib-inicio"
                    type="date"
                    {...field}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fim da Exibição */}
          <FormField
            control={form.control}
            name="exibFim"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fim da Exibição
                </FormLabel>
                <FormControl>
                  <Input
                    data-test="input-exib-fim"
                    type="date"
                    {...field}
                    className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cor */}
          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Cor do Card
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all bg-white" data-test="select-cor">
                      <SelectValue placeholder="Escolha a cor do card" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#CBD5E0] rounded-lg shadow-lg max-h-[300px]">
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="1">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#6B7280] shadow-sm shrink-0"></div>
                        <span>Cinza Escuro</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#F98DBE] shadow-sm shrink-0"></div>
                        <span>Rosa</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#B596FF] shadow-sm shrink-0"></div>
                        <span>Roxo</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#76ADFF] shadow-sm shrink-0"></div>
                        <span>Azul</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="5">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#77D86B] shadow-sm shrink-0"></div>
                        <span>Verde</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#F2CA77] shadow-sm shrink-0"></div>
                        <span>Amarelo</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="7">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#FBA67A] shadow-sm shrink-0"></div>
                        <span>Laranja</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="8">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#FF766D] shadow-sm shrink-0"></div>
                        <span>Vermelho</span>
                      </div>
                    </SelectItem>
                    <SelectItem className="text-[#2D3748] hover:bg-[#F7FAFC] cursor-pointer" value="9">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-white border-2 border-dashed border-gray-400 shrink-0"></div>
                        <span>Transparente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Animação */}
          <FormField
            control={form.control}
            name="animacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#805AD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Animação de Entrada
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all bg-white" data-test="select-animacao">
                      <SelectValue placeholder="Escolha o efeito de animação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent 
                    className="bg-white border border-[#CBD5E0] rounded-lg shadow-lg max-h-[300px]"
                    onCloseAutoFocus={() => onAnimacaoPreview(null)}
                  >
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="1"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Fade In', classe: 'animate__fadeIn' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Fade In (Aparecer)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="2"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Fade In Up', classe: 'animate__fadeInUp' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Fade In Up (Subir)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="3"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Fade In Down', classe: 'animate__fadeInDown' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Fade In Down (Descer)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="4"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Slide In Left', classe: 'animate__slideInLeft' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Slide In Left (Esquerda)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="5"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Slide In Right', classe: 'animate__slideInRight' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Slide In Right (Direita)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="6"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Zoom In', classe: 'animate__zoomIn' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Zoom In (Aproximar)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="7"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Flip In X', classe: 'animate__flipInX' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Flip In X (Girar Horizontal)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="8"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Bounce In', classe: 'animate__bounceIn' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Bounce In (Saltar)
                    </SelectItem>
                    <SelectItem 
                      className="text-[#2D3748] cursor-pointer" 
                      value="9"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Back In Down', classe: 'animate__backInDown' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Back In Down (Voltar de Cima)
                    </SelectItem>
                    <SelectItem 
                      className="cursor-pointer transition text-[#2D3748] cursor-pointer" 
                      value="10"
                      onMouseEnter={() => {
                        onAnimacaoPreview({ nome: 'Back In Up', classe: 'animate__backInUp' });
                        onAnimacaoKeyChange();
                      }}
                      onMouseLeave={() => onAnimacaoPreview(null)}
                    >
                      Back In Up (Voltar de Baixo)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
}
