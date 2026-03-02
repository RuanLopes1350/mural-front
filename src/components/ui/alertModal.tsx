import { useEffect, useRef } from "react";
import { Button } from "./button";

interface AlertModalProps {
    title: string;
    message: string;
    icon: string;
    type: 'successo' | 'erro' | 'alerta' | 'info';
    button1: {
        text: string;
        action: () => void;
        className?: string;
    };
    button2?: {
        text: string;
        action: () => void;
        className?: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function AlertModal({ title, message, icon, type, button1, button2, isOpen, onClose }: AlertModalProps) {
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) {
            return;
        }

        if (isOpen) {
            modalElement.showModal();
        } else {
            modalElement.close();
        }
    }, [isOpen]);

    const handlePrimaryAction = () => {
        button1.action();
        onClose();
    };

    const handleSecondaryAction = () => {
        if (button2) {
            button2.action();
        }
        onClose();
    };

    return (
        <dialog
            ref={modalRef}
            onCancel={onClose}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl p-0 shadow-2xl backdrop:bg-gray-900/60 backdrop:blur-sm m-0"
            data-test="alert-modal"
        >
            <div className="bg-white rounded-xl overflow-hidden flex flex-col">
                {/*icon*/}
                <div className="flex items-start gap-4 p-6">
                    <div className="shrink-0">
                        <img src={icon} className="w-12 h-12 mt-1" draggable="false" alt="ícone" data-test="alert-icon" />
                    </div>

                    {/*texto*/}
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 text-left" data-test="alert-title">{title}</h2>
                        <div className="mt-3">
                            <p className="text-sm text-gray-700 leading-relaxed text-left" data-test="alert-message">{message}</p>
                        </div>
                    </div>
                </div>

                {/*botão*/}
                <div className="flex justify-end gap-2 px-6 pb-6">
                    {button2 && (
                        <Button onClick={handleSecondaryAction} className={button2?.className} data-test="alert-button-secondary">
                            {button2?.text}
                        </Button>
                    )}
                    <Button onClick={handlePrimaryAction} className={button1.className} data-test="alert-button-primary">
                        {button1.text}
                    </Button>
                </div>
            </div>
        </dialog>
    )
}