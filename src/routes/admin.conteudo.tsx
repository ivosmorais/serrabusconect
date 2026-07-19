import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, FileText, MapPin, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { CONTEUDOS, type Conteudo } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/conteudo")({
  component: ConteudoPage,
});

const tipos: Conteudo["tipo"][] = ["Saúde", "Obras", "Educação", "Turismo", "Eventos", "Defesa Civil", "Comunicados"];
const regioes = ["Todas", "Laranjeiras", "Serra Sede", "Jacaraípe", "Carapina", "São Diogo", "Nova Almeida", "Feu Rosa"];

const statusStyles: Record<Conteudo["status"], string> = {
  ativo: "bg-mint/20 text-mint border-mint/30",
  agendado: "bg-cyan/20 text-cyan border-cyan/30",
  encerrado: "bg-white/10 text-white/60 border-white/20",
};

const tipoStyles: Record<Conteudo["tipo"], string> = {
  "Saúde": "bg-mint/15 text-mint",
  "Obras": "bg-warning/15 text-warning",
  "Educação": "bg-cyan/15 text-cyan",
  "Turismo": "bg-mint/15 text-mint",
  "Eventos": "bg-cyan/15 text-cyan",
  "Defesa Civil": "bg-alert/15 text-alert",
  "Comunicados": "bg-white/10 text-white/80",
};

function ConteudoPage() {
  const [items, setItems] = useState<Conteudo[]>(CONTEUDOS);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const filtered = items.filter((c) => filtroTipo === "todos" || c.tipo === filtroTipo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-white">Gestão de Conteúdo</h1>
          <p className="text-sm text-white/60">Campanhas, comunicados e alertas exibidos nos monitores.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-48 border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {tipos.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NovoConteudoDialog onCreate={(c) => setItems((prev) => [c, ...prev])} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total" value={items.length} />
        <StatCard icon={FileText} label="Ativos" value={items.filter(i => i.status === "ativo").length} tone="text-mint" />
        <StatCard icon={CalendarPlus} label="Agendados" value={items.filter(i => i.status === "agendado").length} tone="text-cyan" />
        <StatCard icon={MapPin} label="Regiões cobertas" value={new Set(items.map(i => i.regiao)).size} />
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Título</TableHead>
                <TableHead className="text-white/60">Tipo</TableHead>
                <TableHead className="text-white/60">Região</TableHead>
                <TableHead className="text-white/60">Período</TableHead>
                <TableHead className="text-white/60">Horário</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-right text-white/60">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="border-white/10">
                  <TableCell>
                    <div className="font-semibold">{c.titulo}</div>
                    <div className="text-xs text-white/50">{c.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={tipoStyles[c.tipo]}>{c.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-white/80">{c.regiao}</TableCell>
                  <TableCell className="text-white/70">
                    {new Date(c.inicio).toLocaleDateString("pt-BR")} → {new Date(c.fim).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-white/70">{c.horario}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[c.status]}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setItems((prev) => prev.filter((i) => i.id !== c.id));
                        toast.success("Conteúdo removido");
                      }}
                      className="h-8 w-8 text-white/70 hover:text-alert"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "text-white" }: { icon: typeof FileText; label: string; value: number; tone?: string }) {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
          <div className={`font-display text-3xl ${tone}`}>{value}</div>
        </div>
        <Icon className={`h-6 w-6 ${tone}`} />
      </CardContent>
    </Card>
  );
}

function NovoConteudoDialog({ onCreate }: { onCreate: (c: Conteudo) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "Comunicados" as Conteudo["tipo"],
    regiao: "Todas",
    inicio: "",
    fim: "",
    horario: "06h - 22h",
  });

  const submit = () => {
    if (!form.titulo || !form.inicio || !form.fim) {
      toast.error("Preencha título e período");
      return;
    }
    onCreate({
      id: `C-${Math.floor(Math.random() * 900 + 100)}`,
      titulo: form.titulo,
      tipo: form.tipo,
      regiao: form.regiao,
      inicio: form.inicio,
      fim: form.fim,
      horario: form.horario,
      status: new Date(form.inicio) > new Date() ? "agendado" : "ativo",
    });
    toast.success("Conteúdo cadastrado");
    setForm({ titulo: "", tipo: "Comunicados", regiao: "Todas", inicio: "", fim: "", horario: "06h - 22h" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-mint text-navy-deep hover:bg-mint/90">
          <Plus className="mr-2 h-4 w-4" /> Novo conteúdo
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-navy-deep text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar conteúdo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="border-white/10 bg-white/5 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as Conteudo["tipo"] })}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Região</Label>
              <Select value={form.regiao} onValueChange={(v) => setForm({ ...form, regiao: v })}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regioes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input type="date" value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} className="border-white/10 bg-white/5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Horário</Label>
            <Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} placeholder="Ex.: 06h - 22h" className="border-white/10 bg-white/5 text-white" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} className="bg-mint text-navy-deep hover:bg-mint/90">Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
