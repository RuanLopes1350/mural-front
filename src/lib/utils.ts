import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar datas de eventos no formato "DD MMM YYYY"
export function formatarDataEvento(dataISO: string): string {
  const data = new Date(dataISO);
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
                 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  
  return `${dia} ${mes} ${ano}`;
}

// Função para formatar o horário de início e fim do evento
export function formatarHorarioEvento(dataInicio: string, dataFim: string): string {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  
  const horaInicio = inicio.getHours().toString().padStart(2, '0');
  const minutoInicio = inicio.getMinutes().toString().padStart(2, '0');
  
  const horaFim = fim.getHours().toString().padStart(2, '0');
  const minutoFim = fim.getMinutes().toString().padStart(2, '0');
  
  return `${horaInicio}:${minutoInicio} - ${horaFim}:${minutoFim}`;
}

// Função para extrair URLs de imagens do array de mídia do evento
export function extrairImagensEvento(midia: Array<{ midiTipo: string; midiLink: string }>): string[] {
  return midia
    .filter(m => m.midiTipo.startsWith(''))
    .map(m => m.midiLink);
}