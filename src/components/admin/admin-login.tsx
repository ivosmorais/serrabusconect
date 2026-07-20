import { useState } from "react";
import { Bus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-auth";

export function AdminLogin() {
  const { login } = useAdminAuth();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(user, pass);
      setLoading(false);
      if (!ok) toast.error("Usuário ou senha inválidos");
      else toast.success("Bem-vindo ao painel");
    }, 250);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-radial-navy p-6">
      <Card className="w-full max-w-md border-white/10 bg-white/5 text-white backdrop-blur">
        <CardContent className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-navy-deep">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-2xl tracking-wide">SmartBus</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Painel Administrativo</div>
            </div>
          </div>

          <h1 className="font-display text-3xl tracking-wide">Entrar</h1>
          <p className="mt-1 text-sm text-white/60">Acesso restrito à equipe da Prefeitura da Serra.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-white">Usuário</Label>
              <Input id="user" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username"
                className="border-white/10 bg-white/5 text-white" placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass" className="text-white">Senha</Label>
              <Input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password"
                className="border-white/10 bg-white/5 text-white" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-mint text-navy-deep hover:bg-mint/90">
              <Lock className="mr-2 h-4 w-4" /> {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-white/10 bg-navy-deep/60 p-3 text-xs text-white/60">
            <div className="font-semibold text-white/80">Credenciais de demonstração</div>
            <div className="mt-1 font-mono">admin / admin123</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
