import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Ban,
  MessageSquare,
  RefreshCw,
  RotateCw,
  Search,
  Signal,
  Wifi,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MONITORES, type Monitor, type MonitorStatus } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/monitores")({
  component: MonitoresPage,
});

const statusStyles: Record<MonitorStatus, string> = {
  online: "bg-mint/20 text-mint border-mint/30",
  offline: "bg-alert/20 text-alert border-alert/30",
  manutencao: "bg-warning/20 text-warning border-warning/30",
};

function MonitoresPage() {
  const [query, setQuery] = useState("");
  const filtered = MONITORES.filter(
    (m) =>
      m.nome.toLowerCase().includes(query.toLowerCase()) ||
      m.endereco.toLowerCase().includes(query.toLowerCase()) ||
      m.regiao.toLowerCase().includes(query.toLowerCase()),
  );

  const act = (label: string, monitor: Monitor) => {
    toast.success(`${label}: ${monitor.nome}`, { description: `ID ${monitor.id} — comando enviado (mock).` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-white">Gestão de Monitores</h1>
          <p className="text-sm text-white/60">{MONITORES.length} equipamentos cadastrados na rede.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, endereço ou região..."
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Ponto</TableHead>
                <TableHead className="text-white/60">Endereço</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Sinal</TableHead>
                <TableHead className="text-white/60">Última atualização</TableHead>
                <TableHead className="text-white/60">Temp.</TableHead>
                <TableHead className="text-white/60">Versão</TableHead>
                <TableHead className="text-right text-white/60">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} className="border-white/10">
                  <TableCell>
                    <div className="font-semibold">{m.nome}</div>
                    <div className="text-xs text-white/50">{m.id} · {m.regiao}</div>
                  </TableCell>
                  <TableCell className="text-white/70">{m.endereco}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[m.status]}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Signal className={`h-4 w-4 ${m.sinal > 70 ? "text-mint" : m.sinal > 30 ? "text-warning" : "text-alert"}`} />
                      <span>{m.sinal}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">{m.ultimaAtualizacao}</TableCell>
                  <TableCell>
                    <span className={m.temperatura > 48 ? "text-warning" : "text-white/80"}>
                      {m.temperatura > 0 ? `${m.temperatura}°C` : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/70">{m.versao}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ActionButton icon={RotateCw} label="Reiniciar" onClick={() => act("Reiniciar", m)} />
                      <ActionButton icon={RefreshCw} label="Atualizar" onClick={() => act("Atualizar", m)} />
                      <ActionButton icon={Zap} label="Testar conexão" onClick={() => act("Teste de conexão", m)} />
                      <MessageDialog monitor={m} />
                      <ActionButton icon={Ban} label="Bloquear" onClick={() => act("Bloquear", m)} destructive />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-white/50">
                    Nenhum monitor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Wifi;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white ${destructive ? "hover:text-alert" : ""}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function MessageDialog({ monitor }: { monitor: Monitor }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" title="Enviar mensagem" aria-label="Enviar mensagem" className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-navy-deep text-white">
        <DialogHeader>
          <DialogTitle>Enviar mensagem — {monitor.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="msg">Mensagem exibida no monitor</Label>
          <Textarea
            id="msg"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Ex.: Aviso: interdição na Av. Central às 14h."
            className="border-white/10 bg-white/5 text-white"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              toast.success("Mensagem enviada", { description: `${monitor.nome} recebeu o comunicado.` });
              setMsg("");
              setOpen(false);
            }}
            disabled={!msg.trim()}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
