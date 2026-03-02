"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

function ClientSessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      try {
        const hasRememberCookie = document.cookie.includes("remember_me=1");
        const freshLogin = sessionStorage.getItem("keep_until_close") === "1";

        // Se não há cookie de 'remember' e não é um login recém-criado nesta aba, realiza signOut
        if (!hasRememberCookie && !freshLogin) {
          signOut({ redirect: false });
        }
      } catch (e) {
        // ignorar em ambientes sem document
      }
    }
  }, [session, status]);

  return <>{children}</>;
}

export function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ClientSessionGuard>{children}</ClientSessionGuard>
    </SessionProvider>
  );
}
