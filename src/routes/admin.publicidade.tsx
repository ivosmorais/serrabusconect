import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, DollarSign, Eye, Megaphone, Pause, Play, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ANUNCIOS, ANUNCIANTES, type Anuncio } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/publicidade")({
  component: PublicidadePage,
});

function PublicidadePage() {
  const [items, setItems] = useState<Anuncio[]>(ANUNCIOS);

  const totalExibicoes = items.reduce((s, a) => s + a.exibicoes, 0);
  const ativos = items.filter((a) => a.status === "ativo").length;
  const receita = items.reduce((s, a) => s + a.exibicoes * 0.008, 0);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "ativo" ? "pausado" : "ativo" } : a,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-white">Gestão de Publicidade</h1>
          <p className="text-sm text-white/60">Campanhas de anunciantes e relatórios de exibição.</p>
        </div>
        <NovoAnuncioDialog onCreate={(a) => setItems((prev) => [a, ...prev])} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={Megaphone} label="Campanhas ativas" value={`${ativos}`} tone="text-mint" />
        <KPI icon={Eye} label="Exibições (mês)" value={totalExibicoes.toLocaleString("pt-BR")} tone="text-cyan" />
        <KPI icon={DollarSign} label="Receita estimada" value={`R$ ${receita.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} tone="text-mint" />
        <KPI icon={BarChart3} label="Anunciantes" value={`${ANUNCIANTES.length}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Campanhas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/60">Anunciante / Campanha</TableHead>
                  <TableHead className="text-white/60">Duração</TableHead>
                  <TableHead className="text-white/60">Janela</TableHead>
                  <TableHead className="text-white/60">Região</TableHead>
                  <TableHead className="text-white/60">Exibições</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-right text-white/60">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id} className="border-white/10">
                    <TableCell>
                      <div className="font-semibold">{a.anunciante}</div>
                      <div className="text-xs text-white/60">{a.campanha}</div>
                    </TableCell>
                    <TableCell>{a.duracaoSeg}s</TableCell>
                    <TableCell className="text-white/70">{a.janela}</TableCell>
                    <TableCell className="text-white/70">{a.regiao}</TableCell>
                    <TableCell>{a.exibicoes.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={a.status === "ativo" ? "border-mint/40 text-mint" : "border-white/20 text-white/60"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => toggle(a.id)} title={a.status === "ativo" ? "Pausar" : "Ativar"}>
                          {a.status === "ativo" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-alert" onClick={() => { setItems((p) => p.filter((x) => x.id !== a.id)); toast.success("Campanha removida"); }} title="Remover">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Top anunciantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...items]
              .sort((a, b) => b.exibicoes - a.exibicoes)
              .slice(0, 5)
              .map((a, i) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-navy-deep/60 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint/20 font-display text-mint">{i + 1}</span>
                    <div>
                      <div className="text-sm font-semibold">{a.anunciante}</div>
                      <div className="text-xs text-white/50">{a.campanha}</div>
                    </div>
                  </div>
                  <span className="text-sm text-white/70">{a.exibicoes.toLocaleString("pt-BR")}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, tone = "text-white" }: { icon: typeof Megaphone; label: string; value: string; tone?: string }) {
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

const regioes = ["Todas", "Laranjeiras", "Serra Sede", "Jacaraípe", "Carapina", "São Diogo", "Nova Almeida", "Feu Rosa"];

function NovoAnuncioDialog({ onCreate }: { onCreate: (a: Anuncio) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ anunciante: "", campanha: "", duracaoSeg: 15, janela: "08h - 20h", regiao: "Todas" });

  const submit = () => {
    if (!form.anunciante || !form.campanha) {
      toast.error("Preencha anunciante e campanha");
      return;
    }
    onCreate({
      id: `A-${Math.floor(Math.random() * 900 + 100)}`,
      anunciante: form.anunciante,
      campanha: form.campanha,
      duracaoSeg: form.duracaoSeg,
      janela: form.janela,
      regiao: form.regiao,
      exibicoes: 0,
      status: "ativo",
    });
    toast.success("Campanha cadastrada");
    setForm({ anunciante: "", campanha: "", duracaoSeg: 15, janela: "08h - 20h", regiao: "Todas" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-mint text-navy-deep hover:bg-mint/90">
          <Plus className="mr-2 h-4 w-4" /> Nova campanha
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-navy-deep text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar campanha</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Anunciante</Label>
              <Input value={form.anunciante} onChange={(e) => setForm({ ...form, anunciante: e.target.value })} className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label>Campanha</Label>
              <Input value={form.campanha} onChange={(e) => setForm({ ...form, campanha: e.target.value })} className="border-white/10 bg-white/5 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Duração (s)</Label>
              <Input type="number" min={5} max={60} value={form.duracaoSeg} onChange={(e) => setForm({ ...form, duracaoSeg: Number(e.target.value) })} className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label>Janela</Label>
              <Input value={form.janela} onChange={(e) => setForm({ ...form, janela: e.target.value })} className="border-white/10 bg-white/5 text-white" />
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} className="bg-mint text-navy-deep hover:bg-mint/90">Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
