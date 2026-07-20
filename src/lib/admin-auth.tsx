import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "serra-admin-auth";
// Mock credentials (front-end only). Substituir por Lovable Cloud quando desejar.
export const ADMIN_CREDENTIALS = { user: "admin", pass: "admin123" };

type AuthCtx = {
  authed: boolean;
  ready: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(window.localStorage.getItem(STORAGE_KEY) === "1");
      setReady(true);
    }
  }, []);

  const login = (u: string, p: string) => {
    const ok = u.trim() === ADMIN_CREDENTIALS.user && p === ADMIN_CREDENTIALS.pass;
    if (ok) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
    }
    return ok;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  };

  return <Ctx.Provider value={{ authed, ready, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return c;
}
