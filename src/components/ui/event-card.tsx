import { Evento } from "@/types/eventos";
import { useSession } from "next-auth/react";

interface EventCardProps {
  evento: Evento;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onToggleStatus?: (eventId: string, currentStatus: number) => void;
}

export default function EventCard({ evento, onEdit, onDelete, onToggleStatus }: EventCardProps) {
  const { data: session } = useSession();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para formatar a hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = evento.status === 1
    ? { text: 'Ativo', color: 'bg-green-100 text-green-600 border-green-300' }
    : { text: 'Inativo', color: 'bg-gray-100 text-gray-600 border-gray-300' };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-auto" data-test="event-card">
      {/* Imagem do evento */}
      <div className="relative h-32 bg-gray-100 flex-shrink-0">
        <img
          src={evento.midia && evento.midia.length > 0 ? evento.midia[0].midiLink : "/Group 4.png"}
          alt={evento.titulo}
          className="w-full h-full object-cover"
          data-test="event-image"
        />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`} data-test="event-status-badge">
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        {/* Título */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 font-inter h-12 flex-shrink-0" data-test="event-title">
          {evento.titulo}
        </h3>

        {session?.user?.admin && (
          <div className="bg-blue-100 flex flex-row items-center rounded-2xl max-w-fit px-2 py-1 mb-2 flex-shrink-0">
            <h3 className="text-sm text-gray-600">
              Organizador: {evento.organizador.nome}
            </h3>
          </div>
        )}

        {/* Data e hora */}
        <div className="flex items-center text-sm text-gray-600 mb-1.5" data-test="event-date">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {formatDate(evento.dataInicio)} às {formatTime(evento.dataInicio)}
          </span>
        </div>

        {/* Local */}
        <div className="flex items-center text-sm text-gray-600 mb-2" data-test="event-location">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{evento.local}</span>
        </div>


        {/* Ações*/}
        <div className="flex justify-between items-center mb-auto pb-1">
          {/* Toggle Status */}
          {onToggleStatus && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleStatus(evento._id, evento.status)}
                data-test="event-toggle-status"
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${evento.status === 1
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                  }`}
                title={evento.status === 1 ? 'Desativar evento' : 'Ativar evento'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${evento.status === 1 ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          )}

          <div className="flex space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(evento._id)}
                className="cursor-pointer p-2 text-[#805AD5] hover:bg-purple-50 rounded-lg transition-colors duration-200"
                title="Editar evento"
                data-test="event-edit-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(evento._id)}
                className="cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Excluir evento"
                data-test="event-delete-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}