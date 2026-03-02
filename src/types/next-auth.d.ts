import NextAuth from "next-auth";

declare module "next-auth" {

  interface Session {
    user: {
      id: string;
      _id: string;
      nome: string;
      email: string;
      status: string;
      admin: boolean;
      updatedAt: string;
      accesstoken: string;
      refreshtoken: string;
    };
  }

  interface User {
    id: string;
    _id: string;
    nome: string;
    email: string;
    senha: string;
    status: string;
    admin: boolean;
    updatedAt: string;
    accesstoken: string;
    refreshtoken: string;
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    _id: string;
    nome: string;
    email: string;
    status: string;
    admin: boolean;
    updatedAt: string;
    accesstoken: string;
    refreshtoken: string;
  }
}
