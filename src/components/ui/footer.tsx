'use client'

export default function Footer() {
    return (
        <footer className="border-t-2 border-gray-200 min-h-[60px] bg-white font-inter py-3">
            <div className="container mx-auto px-6 flex flex-row items-center justify-between">
                {/* Logo IFRO e texto - esconde texto em mobile */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <img src="/ifro.svg" className="select-none h-6 sm:h-8" draggable='false' alt="IFRO"/>
                    <p className="hidden sm:block text-[#4B5563] text-xs sm:text-sm font-medium">
                        Instituto Federal de Rondônia
                    </p>
                </div>
                
                {/* Texto central - esconde em telas menores */}
                <div className="hidden lg:flex flex-1 justify-center px-4 mx-4">
                    <p className="text-[#6B7280] text-xs text-center max-w-2xl leading-relaxed">
                        Plataforma de Divulgação de Eventos - Fábrica de Software III - ADS 2024/4 © Todos os direitos reservados.
                    </p>
                </div>
                
                {/* Logo FSLab */}
                <div className="flex items-center shrink-0">
                    <img src="/logo_fslab.svg" alt="Logo FSLab" className="select-none h-7 sm:h-9 w-auto" draggable='false'/>
                </div>
            </div>
        </footer>
    )
}
