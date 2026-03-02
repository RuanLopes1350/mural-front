"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Header() {
    const { data: session } = useSession()
    const pathName = usePathname()?.split('/')[1] || '';

    return (
        <header className="h-16 w-full bg-white border-b border-gray-300 shrink-0">
            <div className="container mx-auto px-4 sm:px-6 h-full flex flex-row items-center justify-between">
                {/* Logo */}
                <Link href='/meus_eventos' className="flex items-center shrink-0">
                    <img
                        src="/ifro-events-icon.svg"
                        className="h-8 sm:h-10 md:h-12 selection:bg-none cursor-pointer"
                        draggable="false"
                        alt="IFRO Events"
                    />
                </Link>

                <div className="flex flex-row gap-2 sm:gap-4 md:gap-6 lg:gap-10 items-center">

                    <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg hover:shadow-md transition-shadow">
                        <span className="text-xs sm:text-sm font-medium text-gray-800 cursor-default">{session?.user?.nome}</span>
                    </div>

                    <Link href='/totem'
                        className="selection:bg-none cursor-pointer text-[#4B5563] flex items-center gap-1 sm:gap-2 border-b-2 border-transparent hover:border-[#4338CA] transition-all py-1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TOTEM
                    </Link>

                    {session?.user?.admin && (
                        pathName === 'meus_eventos' ? (
                            <Link
                                href='/administrativo'
                                className="selection:bg-none cursor-pointer text-[#4B5563] flex items-center gap-1 sm:gap-2 border-b-2 border-transparent hover:border-[#4338CA] transition-all py-1"
                            >
                                <span className="text-xs sm:text-sm md:text-base">Lista de Usuários</span>
                            </Link>
                        ) : (
                            <Link
                                href='/meus_eventos'
                                className="selection:bg-none cursor-pointer text-[#4B5563] flex items-center gap-1 sm:gap-2 border-b-2 border-transparent hover:border-[#4338CA] transition-all py-1"
                            >
                                <span className="text-xs sm:text-sm md:text-base">Meus Eventos</span>
                            </Link>
                        )
                    )}

                    <button
                        type="button"
                        className="selection:bg-none cursor-pointer text-[#4B5563] flex items-center gap-1 sm:gap-2 border-b-2 border-transparent hover:border-[#4338CA] transition-all py-1"
                        onClick={() => {
                            setTimeout(() => {
                                signOut({ callbackUrl: `${window.location.origin}/login` });
                            }, 0);
                        }}
                    >
                        <img
                            src="/exit.svg"
                            className="w-4 h-4 selection:bg-none"
                            draggable="false"
                            alt="Sair"
                        />
                        <span className="text-xs sm:text-sm md:text-base">Sair</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
