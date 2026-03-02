"use client";

import { useState } from "react";
import CardContainer from "@/components/ui/card-container";
import Modal from "@/components/ui/modal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useEventos, useToggleEventStatus, useDeleteEvent } from "@/hooks/useEventos";
import { ThreeDot } from "react-loading-indicators";
import { useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 8;

export default function MeusEventosPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        category: "all",
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        eventId: "",
        eventTitle: "",
    });

    const { data, isLoading, isError } = useEventos({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        filters,
    });

    const { toggleStatus } = useToggleEventStatus();
    const { deleteEvent } = useDeleteEvent();

    const eventos = data?.data?.docs || [];
    const totalPages = data?.data?.totalPages || 0;
    const totalDocs = data?.data?.totalDocs || 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (newFilters: { search: string; status: string; category: string }) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleEdit = (eventId: string) => {
        router.push(`/editar_eventos/${eventId}`);
    };

    const handleDelete = (eventId: string) => {
        const evento = eventos.find(e => e._id === eventId);

        setDeleteModal({
            isOpen: true,
            eventId,
            eventTitle: evento?.titulo || "este evento",
        });
    };

    const confirmDelete = async () => {
        try {
            await deleteEvent(deleteModal.eventId);
            setDeleteModal({ isOpen: false, eventId: "", eventTitle: "" });
        } catch (_error) {
            setDeleteModal({ isOpen: false, eventId: "", eventTitle: "" });
        }
    };

    const handleToggleStatus = async (eventId: string, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;

        try {
            await toggleStatus({ eventId, newStatus });
        } catch (_error) {}
    };

    const handleCriarEvento = () => {
        router.push("/criar_eventos");
    };

    return (
        <div className="font-inter" data-test="meus-eventos-page">

            {/* Banner Hero */}
            <div className="relative overflow-hidden bg-indigo-700" data-test="hero-banner">
                <div className="container mx-auto px-6 py-12 lg:py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4"
                            data-test="hero-title">
                            Facilidade para os professores, Informação para os alunos!
                        </h1>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed"
                            data-test="hero-subtitle">
                            Gerencie eventos acadêmicos, culturais e institucionais e exiba nos totens do campus em poucos cliques.
                        </p>

                        <button
                            onClick={handleCriarEvento}
                            data-test="btn-criar-evento"
                            className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg cursor-pointer transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Criar Evento
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-[#F9FAFB] min-h-[calc(100vh-400px)]">
                <div className="container mx-auto px-6 py-8">

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 min-h-[400px]"
                            data-test="loading">
                            <ThreeDot variant="bounce" color="#4338CA" size="medium" />
                            <span className="mt-3 text-gray-600">Carregando eventos...</span>
                        </div>
                    )}

                    {isError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center min-h-[400px]"
                            data-test="error-box">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                Erro ao carregar eventos
                            </h3>
                            <p className="text-red-600">
                                Ocorreu um erro ao carregar os eventos. Tente novamente.
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <>
                            <CardContainer
                                eventos={eventos}
                                titulo="Meus Eventos"
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                                onFilterChange={handleFilterChange}
                                initialFilters={filters}
                                data-test="card-container"
                            />

                            {totalPages > 1 && (
                                <div className="flex flex-col items-center space-y-4 mt-8">
                                    <div className="text-sm text-gray-600" data-test="pagination-info">
                                        Página {currentPage} de {totalPages} ({totalDocs} eventos no total)
                                    </div>

                                    <Pagination data-test="pagination">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <button
                                                    data-test="btn-prev-page"
                                                    type="button"
                                                    onClick={() => {
                                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                                    }}
                                                    disabled={currentPage === 1}
                                                    className="cursor-pointer px-3 py-2 bg-white border rounded-md text-gray-700"
                                                >
                                                    Anterior
                                                </button>
                                            </PaginationItem>

                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = index + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = index + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + index;
                                                } else {
                                                    pageNum = currentPage - 2 + index;
                                                }

                                                return (
                                                    <PaginationItem key={pageNum}>
                                                        <button
                                                            data-test={`page-${pageNum}`}
                                                            type="button"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`cursor-pointer px-3 py-2 border rounded-md ${
                                                                currentPage === pageNum
                                                                    ? "bg-indigo-600 text-white"
                                                                    : "bg-white text-gray-700"
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    </PaginationItem>
                                                );
                                            })}

                                            <PaginationItem>
                                                <button
                                                    data-test="btn-next-page"
                                                    type="button"
                                                    onClick={() => {
                                                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                                    }}
                                                    disabled={currentPage === totalPages}
                                                    className="cursor-pointer px-3 py-2 bg-white border rounded-md text-gray-700"
                                                >
                                                    Próximo
                                                </button>
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Modal
                titulo="Confirmar Exclusão"
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, eventId: "", eventTitle: "" })}
                data-test="delete-modal"
            >
                <p className="text-gray-700 mb-4" data-test="modal-text">
                    Tem certeza que deseja excluir o evento <strong>"{deleteModal.eventTitle}"</strong>?
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setDeleteModal({ isOpen: false, eventId: "", eventTitle: "" })}
                        data-test="btn-cancel-delete"
                        className="px-6 py-2.5 bg-white border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={confirmDelete}
                        data-test="btn-confirm-delete"
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
                    >
                        Excluir
                    </button>
                </div>
            </Modal>
        </div>
    );
}
