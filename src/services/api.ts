import { getSession } from "next-auth/react";

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchError {
  status: number;
  message: string;
  [key: string]: any;
}

export async function fetchData<T>(
  url: string,
  method: FetchMethod = "GET",
  token?: string | null,
  body?: unknown
): Promise<T> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL não está definido");

  // Se não receber token, tenta pegar da sessão NextAuth
  if (!token && typeof window !== "undefined") {
    const session = await getSession();
    token = session?.user?.accesstoken ?? null;
  }

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { "Content-Type": "application/json" } : {}),
  };

  const options: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${url}`, options);
  } catch (err) {
    throw { status: 0, message: "Erro de conexão com a API", error: err } as FetchError;
  }

  let data: T | FetchError;
  try {
    data = (await response.json()) as T;
  } catch {
    data = { status: response.status, message: "Resposta da API não é JSON válido" };
  }

  if (!response.ok) {
    if (response.status === 498) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
        return {} as T;
      }
    }
    throw {
      status: response.status,
      message: (data as any)?.message || "Erro na requisição",
      ...data,
    } as FetchError;
  }

  return data as T;
}