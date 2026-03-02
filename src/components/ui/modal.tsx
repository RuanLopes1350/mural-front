"use client";

import { X } from "lucide-react";

interface ModalProps {
    titulo: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ titulo, isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
            data-test="modal-overlay"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl p-6 md:p-8 relative animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                data-test="modal-content"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[#111827]" data-test="modal-title">{titulo}</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer transition text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Fechar modal"
                        data-test="modal-close-button"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="text-gray-700" data-test="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}