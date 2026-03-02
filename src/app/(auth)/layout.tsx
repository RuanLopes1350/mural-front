import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonitorPlay } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* --- INÍCIO DO BOTÃO TOTEM --- */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <Link href="/totem" target="_blank" rel="noopener noreferrer">
          <Button className="animated-border gap-2 px-5 py-2 bg-white text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer shadow-md hover:shadow-lg">
            <MonitorPlay className="w-5 h-5" />
            <span className="hidden md:inline font-medium text-[1rem]">Totem</span>
          </Button>
        </Link>
      </div>
      {/* --- FIM DO BOTÃO TOTEM --- */}

      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}