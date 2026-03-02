import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Função auxiliar para renovar o access token usando o refresh token.
 */
async function refreshAccessToken(token: JWT) {
  try {
    console.log('[Auth] refreshAccessToken called for token id:', token?.id);
    const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshtoken }),
    });

    if (!res.ok) throw new Error("Falha ao renovar token");

    const json = await res.json();
    const data = json.data;

    // Backend may return tokens under data.user (example) or data.usuario
    const userData = (data && (data.user ?? data.usuario)) || data || null;

    if (!userData) {
      throw new Error('Formato de resposta inesperado ao renovar token');
    }

    const oldRT = token?.refreshtoken;
    const newRT = userData.refreshtoken ?? oldRT;

    return {
      ...token,
      accesstoken: userData.accesstoken ?? token.accesstoken,
      // substitui o refresh token se a API retornou um novo
      refreshtoken: newRT,
      accessTokenExpires: Date.now() + 10 * 60 * 1000, // ✅ 10 minutos
      user: userData ?? token.user,
      admin: userData.admin ?? token.admin ?? false,
    };
  } catch (err) {
    console.error("Erro ao renovar token:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.senha) return null;

        const res = await fetch(`${process.env.API_URL_SERVER_SIDED}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            senha: credentials.senha,
          }),
        });

        if (!res.ok) return null;

        const json = await res.json();
        const data = json.data;

        if (data && data.user._id) {
          return {
            id: data.user._id,
            _id: data.user._id,
            nome: data.user.nome ?? "",
            email: data.user.email ?? "",
            senha: data.user.senha ?? "",
            status: data.user.status ?? "",
            admin: data.user.admin ?? false,
            updatedAt: data.user.updatedAt ?? "",
            accesstoken: data.user.accesstoken ?? "",
            refreshtoken: data.user.refreshtoken ?? "",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('[Auth] jwt initial token set for user id:', user.id, 'expires in (ms):', 10 * 60 * 1000);
        return {
          id: user.id,
          _id: user._id,
          nome: user.nome,
          email: user.email,
          status: user.status,
          admin: user.admin,
          updatedAt: user.updatedAt,
          accesstoken: user.accesstoken,
          refreshtoken: user.refreshtoken,
          accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutos
        };
      }

      // 2️⃣ Token ainda válido
      if (Date.now() < Number(token.accessTokenExpires ?? 0)) {
        // token válido — nothing to do
        return token;
      }

      // 3️⃣ Token expirou → tenta renovar
      console.log('[Auth] access token expired for token id:', token?.id, 'attempting refresh');
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          id: token.id,
          _id: token._id,
          nome: token.nome,
          email: token.email,
          status: token.status,
          admin: token.admin,
          updatedAt: token.updatedAt,
          accesstoken: token.accesstoken,
          refreshtoken: token.refreshtoken,
        };
      }

      // Se o refresh falhou, forçar logout no cliente
      if (token?.error === "RefreshAccessTokenError" && typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Necessário para evitar erro de validação de host quando atrás de proxy
  useSecureCookies: process.env.NODE_ENV === "production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
