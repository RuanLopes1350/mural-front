import { z } from "zod";

// ========== STEP 1: Informações Básicas ==========
export const step1Schema = z
  .object({
    titulo: z.string().min(3, "O título deve ter ao menos 3 caracteres"),
    descricao: z.string().min(10, "A descrição deve ter ao menos 10 caracteres"),
    categoria: z.string().min(1, "A categoria é obrigatória"),
    local: z.string().min(1, "O local é obrigatório"),
    dataInicio: z.string().min(1, "A data de início é obrigatória"),
    dataFim: z.string().min(1, "A data de fim é obrigatória"),
    link: z
      .string()
      .optional()
      .nullable()
      .refine(
        (v: unknown) => {
          if (!v || v === "") return true;
          try {
            new URL(String(v));
            return true;
          } catch (e) {
            return false;
          }
        },
        { message: "Link inválido" }
      ),
    tags: z
      .array(z.string())
      .min(1, "Pelo menos uma tag é obrigatória")
      .refine((arr) => arr.every((tag) => tag.trim().length > 0), {
        message: "Tags não podem estar vazias",
      }),
  })
  .superRefine((data, ctx) => {
    // Validate dataInicio <= dataFim
    if (data.dataInicio && data.dataFim) {
      const start = new Date(data.dataInicio);
      const end = new Date(data.dataFim);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dataFim"],
          message: "A data de fim não pode ser anterior à data de início",
        });
      }
    }
  });

// ========== STEP 2: Upload de Mídia ==========
export const step2Schema = z.object({});

// ========== STEP 3: Configurações de Exibição ==========
export const step3Schema = z
  .object({
    exibDia: z
      .array(z.string())
      .min(1, "Selecione pelo menos um dia da semana")
      .refine((arr) => arr.every((dia) => dia.trim().length > 0), {
        message: "Dias da semana não podem estar vazios",
      }),
    exibManha: z.boolean(),
    exibTarde: z.boolean(),
    exibNoite: z.boolean(),
    exibInicio: z.string().min(1, "O início da exibição é obrigatório"),
    exibFim: z.string().min(1, "O fim da exibição é obrigatório"),
    cor: z.string().min(1, "A cor é obrigatória"),
    animacao: z.string().min(1, "A animação é obrigatória"),
  })
  .superRefine((data, ctx) => {
    // Validate exibInicio <= exibFim
    if (data.exibInicio && data.exibFim) {
      const start = new Date(data.exibInicio);
      const end = new Date(data.exibFim);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exibFim"],
          message: "O fim da exibição não pode ser anterior ao início",
        });
      }
    }

    // Validate at least one checkbox is selected
    if (!data.exibManha && !data.exibTarde && !data.exibNoite) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exibManha"],
        message: "Selecione pelo menos um período de exibição",
      });
    }
  });

// ========== SCHEMA COMPLETO==========
export const criarEventoSchema = step1Schema.merge(step3Schema);

export type CriarEventoForm = z.infer<typeof criarEventoSchema>;
export type Step1Form = z.infer<typeof step1Schema>;
export type Step2Form = z.infer<typeof step2Schema>;
export type Step3Form = z.infer<typeof step3Schema>;
