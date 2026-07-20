import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  DollarSign,
  Eye,
  FileIcon,
  Film,
  Image as ImageIcon,
  Megaphone,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
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

type MediaKind = "image" | "video" | "gif" | "file";
type MediaItem = {
  id: string;
  kind: MediaKind;
  name: string;
  url: string; // data URL
  mime: string;
  size: number;
};

type AnuncioComMidia = Anuncio & { media?: MediaItem[] };

function detectKind(mime: string, name: string): MediaKind {
  if (mime.startsWith("video/")) return "video";
  if (mime === "image/gif" || name.toLowerCase().endsWith(".gif")) return "gif";
  if (mime.startsWith("image/")) return "image";
  return "file";
}

function PublicidadePage() {
  const [items, setItems] = useState<AnuncioComMidia[]>(ANUNCIOS);

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
                  <TableHead className="text-white/60">Mídias</TableHead>
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
                    <TableCell className="text-white/70">{a.media?.length ?? 0}</TableCell>
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

function NovoAnuncioDialog({ onCreate }: { onCreate: (a: AnuncioComMidia) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    anunciante: "",
    campanha: "",
    duracaoSeg: 15,
    janela: "08h - 20h",
    regiao: "Todas",
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setForm({ anunciante: "", campanha: "", duracaoSeg: 15, janela: "08h - 20h", regiao: "Todas" });
    setMedia([]);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const readers = list.map(
      (f) =>
        new Promise<MediaItem>((res, rej) => {
          const r = new FileReader();
          r.onload = () =>
            res({
              id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              kind: detectKind(f.type, f.name),
              name: f.name,
              url: r.result as string,
              mime: f.type || "application/octet-stream",
              size: f.size,
            });
          r.onerror = rej;
          r.readAsDataURL(f);
        }),
    );
    try {
      const items = await Promise.all(readers);
      setMedia((prev) => [...prev, ...items]);
      toast.success(`${items.length} mídia(s) adicionada(s)`);
    } catch {
      toast.error("Falha ao ler algum arquivo");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeMedia = (id: string) =>
    setMedia((prev) => prev.filter((m) => m.id !== id));

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
      media,
    });
    toast.success("Campanha cadastrada");
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-mint text-navy-deep hover:bg-mint/90">
          <Plus className="mr-2 h-4 w-4" /> Nova campanha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-navy-deep text-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-mint" /> Cadastrar campanha
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2 md:grid-cols-2">
          {/* FORM */}
          <div className="space-y-4">
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
                <Label>Duração/mídia (s)</Label>
                <Input type="number" min={3} max={60} value={form.duracaoSeg} onChange={(e) => setForm({ ...form, duracaoSeg: Number(e.target.value) })} className="border-white/10 bg-white/5 text-white" />
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

            <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Mídias do anúncio</Label>
                <div className="flex gap-1 text-white/50">
                  <ImageIcon className="h-4 w-4" />
                  <Film className="h-4 w-4" />
                  <FileIcon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-white/60">
                Adicione fotos, GIFs, vídeos ou arquivos. O totem à direita atualiza em tempo real.
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*,.gif,.pdf"
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
              <Button
                type="button"
                onClick={() => fileRef.current?.click()}
                variant="outline"
                className="w-full border-dashed border-white/20 bg-transparent text-white hover:bg-white/5"
              >
                <Upload className="mr-2 h-4 w-4" /> Adicionar arquivos
              </Button>

              {media.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {media.map((m) => (
                    <div key={m.id} className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-navy-deep">
                      {m.kind === "video" ? (
                        <video src={m.url} className="h-full w-full object-cover" muted />
                      ) : m.kind === "image" || m.kind === "gif" ? (
                        <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileIcon className="h-6 w-6 text-white/60" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(m.id)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label={`Remover ${m.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white/80">
                        {m.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MOCKUP DO TOTEM */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white">Pré-visualização — Totem Digital</Label>
              <Badge variant="outline" className="border-mint/40 text-mint">Ao vivo</Badge>
            </div>
            <TotemMockup media={media} durationSec={form.duracaoSeg} anunciante={form.anunciante} campanha={form.campanha} />
            <p className="text-center text-xs text-white/50">
              O carrossel gira a cada {form.duracaoSeg}s. As alterações refletem em tempo real.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { setOpen(false); reset(); }}>Cancelar</Button>
          <Button onClick={submit} className="bg-mint text-navy-deep hover:bg-mint/90">Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TotemMockup({
  media,
  durationSec,
  anunciante,
  campanha,
}: {
  media: MediaItem[];
  durationSec: number;
  anunciante: string;
  campanha: string;
}) {
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());

  const safeMedia = useMemo(() => media, [media]);

  useEffect(() => {
    if (safeMedia.length <= 1) return;
    const ms = Math.max(3, durationSec) * 1000;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % safeMedia.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [safeMedia.length, durationSec]);

  useEffect(() => {
    if (idx >= safeMedia.length) setIdx(0);
  }, [safeMedia.length, idx]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const current = safeMedia[idx];

  return (
    <div className="mx-auto w-full max-w-[320px]">
      {/* Totem frame */}
      <div className="rounded-[36px] border-[10px] border-neutral-800 bg-neutral-900 p-2 shadow-2xl">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[24px] bg-navy-deep">
          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-navy-deep/80 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur">
            <span className="font-display tracking-widest">SMARTBUS</span>
            <span>{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          {/* Media area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!current ? (
              <div className="px-6 text-center text-xs text-white/50">
                <Upload className="mx-auto mb-2 h-6 w-6" />
                Adicione mídias para visualizar
              </div>
            ) : current.kind === "video" ? (
              <video key={current.id} src={current.url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : current.kind === "image" || current.kind === "gif" ? (
              <img key={current.id} src={current.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/70">
                <FileIcon className="h-8 w-8" />
                <div className="max-w-[80%] truncate text-center text-[10px]">{current.name}</div>
              </div>
            )}
          </div>

          {/* Bottom overlay: anunciante / campanha */}
          <div className="absolute inset-x-0 bottom-0 z-10 space-y-0.5 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8">
            <div className="text-[10px] uppercase tracking-widest text-mint">Publicidade</div>
            <div className="truncate font-display text-base leading-tight text-white">
              {anunciante || "Nome do anunciante"}
            </div>
            <div className="truncate text-[11px] text-white/80">
              {campanha || "Título da campanha"}
            </div>
          </div>

          {/* Progress dots */}
          {safeMedia.length > 1 && (
            <div className="absolute left-1/2 top-8 z-10 flex -translate-x-1/2 gap-1">
              {safeMedia.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-4 rounded-full transition ${i === idx ? "bg-mint" : "bg-white/25"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-white/40">
        Totem 9:16 · Ponto de ônibus
      </div>
    </div>
  );
}
