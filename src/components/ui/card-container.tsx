"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import EventCard from "./event-card";
import { Evento } from "@/types/eventos";
import { Input } from "./input";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface CardContainerProps {
  eventos: Evento[];
  titulo?: string;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onToggleStatus?: (eventId: string, currentStatus: number) => void;
  onFilterChange?: (filters: { search: string; status: string; category: string }) => void;
  initialFilters?: { search: string; status: string; category: string };
}

export default function CardContainer({
  eventos,
  titulo = "Meus Eventos",
  onEdit,
  onDelete,
  onToggleStatus,
  onFilterChange,
  initialFilters = { search: "", status: "all", category: "all" },
}: CardContainerProps) {
  const [searchText, setSearchText] = useState(initialFilters.search);
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.category);
  const isFirstRender = useRef(true);

  // Debounce para a busca
  useEffect(() => {
    const isFirst = isFirstRender.current;
    const timer = setTimeout(() => {
      if (isFirst) {
        // Não disparar o onFilterChange na primeira montagem; apenas marcar que já passou
        isFirstRender.current = false;
        return;
      }

      if (onFilterChange) {
        onFilterChange({
          search: searchText,
          status: statusFilter,
          category: categoryFilter,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]); 

  // Aplicar filtros imediatamente para status e categoria (sem debounce)
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          search: searchText,
          status: value,
          category: categoryFilter,
        });
      }
    }, 0);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          search: searchText,
          status: statusFilter,
          category: value,
        });
      }
    }, 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-test="card-container">
      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6" data-test="card-container-title">{titulo}</h1>

      {/* Barra de busca e filtros */}
      <form onSubmit={handleSearch} className="mb-6" data-test="search-form">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Campo de busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 py-3 border-2 border-[#E2E8F0] rounded-lg text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all bg-white"
              data-test="search-input"
            />
          </div>

          {/* Filtro de status */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={handleStatusChange} data-test="filter-status">
              <SelectTrigger className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all bg-white">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                  <SelectItem value="all" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Todos os status</SelectItem>
                  <SelectItem value="active" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Ativo</SelectItem>
                  <SelectItem value="inactive" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de categoria */}
          <div className="w-full md:w-52">
            <Select value={categoryFilter} onValueChange={handleCategoryChange} data-test="filter-category">
              <SelectTrigger className="w-full border-2 border-[#E2E8F0] rounded-lg px-4 py-3 text-[#2D3748] focus:outline-none focus:border-[#805AD5] focus:ring-4 focus:ring-[#E9D8FD] transition-all bg-white">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                  <SelectItem value="all" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Todas as categorias</SelectItem>
                  <SelectItem value="empreendedorismo - Inovacao" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Empreendedorismo & Inovação</SelectItem>
                  <SelectItem value="artistico - Cultural" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Artistico & Cultural</SelectItem>
                  <SelectItem value="cientifico - Tecnologico" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Científico & Tecnológico</SelectItem>
                  <SelectItem value="desportivos" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Desportivos</SelectItem>
                  <SelectItem value="palestra" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Palestra</SelectItem>
                  <SelectItem value="workshops" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Workshops</SelectItem>
                  <SelectItem value="atividades - Sociais" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Atividades Sociais</SelectItem>
                  <SelectItem value="gestao - Pessoas" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Gestão de Pessoas</SelectItem>
                  <SelectItem value="outro" className="text-[#2D3748] hover:bg-[#F7FAFC] hover:text-[#805AD5] cursor-pointer">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </form>

      {/* Grid de cards */}
      {eventos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-test="events-grid">
          {eventos.map((evento) => (
            <EventCard
              key={evento._id}
              evento={evento}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12" data-test="empty-state">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum evento encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      )}
    </div>
  );
}
