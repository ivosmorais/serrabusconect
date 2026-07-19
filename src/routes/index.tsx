import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bus as BusIcon,
  Cloud,
  Wifi,
  AlertTriangle,
  Syringe,
  Calendar,
  QrCode,
  MapPin,
  Signal,
  ShieldAlert,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serra SmartBus — Ponto Terminal Laranjeiras" },
      {
        name: "description",
        content:
          "Monitor inteligente do transporte público da Serra em tempo real, com alertas oficiais e comunicados da Prefeitura.",
      },
    ],
  }),
  component: MonitorScreen,
});

type Bus = {
  line: string;
  destination: string;
  etaSeconds: number;
};

const INITIAL_BUSES: Bus[] = [
  { line: "523", destination: "Terminal Laranjeiras", etaSeconds: 60 },
  { line: "507", destination: "Centro / Vitória", etaSeconds: 5 * 60 },
  { line: "814", destination: "Jacaraípe", etaSeconds: 11 * 60 },
  { line: "850", destination: "Serra Dourada", etaSeconds: 18 * 60 },
];

type Rotator =
  | { kind: "alert"; title: string; body: string; phone: string }
  | { kind: "campaign"; tag: string; title: string; body: string; when: string }
  | { kind: "event"; tag: string; title: string; place: string; when: string }
  | { kind: "ad"; tag: string; title: string; body: string };

const ROTATORS: Rotator[] = [
  {
    kind: "campaign",
    tag: "Secretaria de Saúde",
    title: "Vacinação contra a Gripe",
    body: "Procure a unidade de saúde mais próxima. Leve documento e cartão de vacina.",
    when: "Sábado · 08h às 16h",
  },
  {
    kind: "alert",
    title: "Chuvas intensas nas próximas horas",
    body: "Evite áreas de risco e alagamentos. Em caso de emergência, ligue para a Defesa Civil.",
    phone: "199",
  },
  {
    kind: "event",
    tag: "Cultura",
    title: "Festival Cultural da Serra",
    place: "Praça Central · Entrada gratuita",
    when: "Sexta a Domingo · 18h",
  },
  {
    kind: "campaign",
    tag: "Educação",
    title: "Matrículas abertas na Rede Municipal",
    body: "Garanta a vaga do seu filho na escola mais próxima de casa.",
    when: "Até 30 de novembro",
  },
  {
    kind: "ad",
    tag: "Turismo Serra",
    title: "Conheça as praias de Jacaraípe",
    body: "Roteiros, hospedagem e gastronomia local no portal da Prefeitura.",
  },
];

function formatEta(seconds: number) {
  if (seconds < 60) return { big: seconds.toString().padStart(2, "0"), unit: "SEG" };
  const min = Math.floor(seconds / 60);
  return { big: min.toString(), unit: min === 1 ? "MIN" : "MIN" };
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function MonitorScreen() {
  const now = useClock();
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [rotatorIdx, setRotatorIdx] = useState(0);

  // Tick down ETAs every second; reset when it reaches 0.
  useEffect(() => {
    const id = setInterval(() => {
      setBuses((prev) =>
        prev.map((b) => ({
          ...b,
          etaSeconds: b.etaSeconds <= 0 ? 20 * 60 + Math.floor(Math.random() * 300) : b.etaSeconds - 1,
        })),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Rotate secondary content every 8s.
  useEffect(() => {
    const id = setInterval(() => setRotatorIdx((i) => (i + 1) % ROTATORS.length), 8000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => [...buses].sort((a, b) => a.etaSeconds - b.etaSeconds), [buses]);
  const arrivingList = sorted.filter((b) => b.etaSeconds < 60);
  const rotator = ROTATORS[rotatorIdx];

  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceIntervalMinutes, setVoiceIntervalMinutes] = useState(2);

  // Load accessibility preferences from localStorage after hydration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("serra-smartbus-accessibility");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.voiceIntervalMinutes === "number") {
          setVoiceIntervalMinutes(parsed.voiceIntervalMinutes);
        }
        if (typeof parsed.voiceOn === "boolean") {
          setVoiceOn(parsed.voiceOn);
        }
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  // Persist accessibility preferences whenever they change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "serra-smartbus-accessibility",
      JSON.stringify({ voiceOn, voiceIntervalMinutes }),
    );
  }, [voiceOn, voiceIntervalMinutes]);

  const lastAnnouncedArrivingRef = useRef<string>("");
  const sortedRef = useRef(sorted);
  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }, []);

  const announceNext = useCallback(() => {
    const list = sortedRef.current.slice(0, 3);
    if (list.length === 0) return;
    const parts = list.map((b) => {
      if (b.etaSeconds < 60) {
        return `Linha ${b.line} para ${b.destination}, chegando agora.`;
      }
      const min = Math.max(1, Math.round(b.etaSeconds / 60));
      return `Linha ${b.line} para ${b.destination}, em ${min} ${min === 1 ? "minuto" : "minutos"}.`;
    });
    speak(`Próximos ônibus no Terminal Laranjeiras. ${parts.join(" ")}`);
  }, [speak]);

  // Periodic announcement based on the configured interval.
  useEffect(() => {
    if (!voiceOn) return;
    announceNext();
    const id = setInterval(announceNext, voiceIntervalMinutes * 60 * 1000);
    return () => {
      clearInterval(id);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voiceOn, announceNext, voiceIntervalMinutes]);

  // Immediate announcement when a bus is arriving (ETA < 1 min).
  useEffect(() => {
    if (!voiceOn) return;
    const key = arrivingList.map((b) => b.line).join(",");
    if (!key || key === lastAnnouncedArrivingRef.current) return;
    lastAnnouncedArrivingRef.current = key;
    const names = arrivingList.map((b) => `Linha ${b.line} para ${b.destination}`).join(", e ");
    speak(`Atenção. ${names}, chegando ao ponto agora.`);
  }, [arrivingList, voiceOn, speak]);

  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now
    .toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
    .replace(/^./, (c) => c.toUpperCase());

  return (
    <main className="min-h-screen bg-radial-navy text-foreground flex flex-col">
      <TopBar
        timeStr={timeStr}
        dateStr={dateStr}
        voiceOn={voiceOn}
        voiceIntervalMinutes={voiceIntervalMinutes}
        onToggleVoice={() => {
          setVoiceOn((v) => {
            const next = !v;
            if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            return next;
          });
        }}
        onAnnounceNow={announceNext}
        onChangeVoiceInterval={setVoiceIntervalMinutes}
      />


      {arrivingList.length >= 2 ? (
        <ArrivingSplit buses={arrivingList.slice(0, 2)} />
      ) : arrivingList.length === 1 ? (
        <ArrivingHero bus={arrivingList[0]} />
      ) : (
        <>
          <NextBusesSection buses={sorted} />
          <RotatorSection rotator={rotator} />
        </>
      )}

      <BottomBar />
    </main>
  );
}

function ArrivingSplit({ buses }: { buses: Bus[] }) {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
      {buses.map((bus, i) => (
        <ArrivingPane key={bus.line} bus={bus} variant={i === 0 ? "mint" : "cyan"} />
      ))}
    </section>
  );
}

function ArrivingPane({ bus, variant }: { bus: Bus; variant: "mint" | "cyan" }) {
  const secs = bus.etaSeconds.toString().padStart(2, "0");
  const isMint = variant === "mint";
  return (
    <div
      className={`relative flex flex-1 items-center justify-center overflow-hidden border-white/15 ${
        isMint ? "bg-mint text-navy-deep" : "bg-cyan text-white"
      } border-b md:border-b-0 md:border-r last:border-0`}
    >
      <div className="absolute inset-0 grid-lines opacity-20" />
      <div className="animate-pulse-arrive relative z-10 px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.35em] md:text-sm">
          Ônibus chegando
        </p>
        <p className="mt-2 font-display text-[26vw] leading-none tracking-widest md:text-[11rem]">
          {bus.line}
        </p>
        <p className="font-display text-3xl tracking-wider md:text-5xl">CHEGANDO</p>
        <p className="mt-3 font-display text-5xl tabular-nums md:text-7xl">00:{secs}</p>
        <p className="mt-2 font-display text-lg tracking-wide md:text-2xl">
          {bus.destination}
        </p>
      </div>
    </div>
  );
}

function AccessibilitySettings({
  voiceOn,
  voiceIntervalMinutes,
  onChangeVoiceInterval,
}: {
  voiceOn: boolean;
  voiceIntervalMinutes: number;
  onChangeVoiceInterval: (minutes: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Abrir configurações de acessibilidade"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Acessibilidade</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-white/10 bg-navy-deep text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl tracking-wide text-white">
            Acessibilidade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-toggle" className="text-base text-white">
                Anúncios por voz
              </Label>
              <button
                type="button"
                id="voice-toggle"
                aria-pressed={voiceOn}
                onClick={() => {
                  if (voiceOn && typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  // Toggle is handled by the parent; we only close the dialog if needed.
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  voiceOn ? "bg-mint" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    voiceOn ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-white/60">
              Quando ativados, os próximos ônibus são anunciados em voz alta em português.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="voice-interval" className="text-base text-white">
              Intervalo entre anúncios
            </Label>
            <Select
              value={voiceIntervalMinutes.toString()}
              onValueChange={(value) => onChangeVoiceInterval(Number(value))}
            >
              <SelectTrigger
                id="voice-interval"
                aria-label="Intervalo entre anúncios de voz"
                className="border-white/10 bg-white/5 text-white focus:ring-mint"
              >
                <SelectValue placeholder="Selecione o intervalo" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-navy-deep text-white">
                <SelectItem value="1">1 minuto</SelectItem>
                <SelectItem value="2">2 minutos</SelectItem>
                <SelectItem value="3">3 minutos</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-white/60">
              Define de quanto em quanto tempo a lista de próximos ônibus é anunciada.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TopBar({
  timeStr,
  dateStr,
  voiceOn,
  voiceIntervalMinutes,
  onToggleVoice,
  onAnnounceNow,
  onChangeVoiceInterval,
}: {
  timeStr: string;
  dateStr: string;
  voiceOn: boolean;
  voiceIntervalMinutes: number;
  onToggleVoice: () => void;
  onAnnounceNow: () => void;
  onChangeVoiceInterval: (minutes: number) => void;
}) {
  return (
    <header className="w-full border-b border-white/10 bg-navy-deep/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-mint text-navy-deep">
            <BusIcon className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-2xl tracking-wider text-mint">SERRA SMARTBUS</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Prefeitura da Serra · ES
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-white/80 md:flex">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-mint" />
            <span className="font-medium">Terminal Laranjeiras · Plataforma B</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="h-4 w-4 text-mint" />
            <span className="font-semibold">26°C</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Signal className="h-4 w-4 text-success" />
            <span className="font-medium">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleVoice}
              aria-label={voiceOn ? "Desativar anúncios por voz" : "Ativar anúncios por voz"}
              aria-pressed={voiceOn}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                voiceOn
                  ? "border-mint bg-mint text-navy-deep"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{voiceOn ? "Voz ativa" : "Voz"}</span>
            </button>
            {voiceOn ? (
              <button
                type="button"
                onClick={onAnnounceNow}
                aria-label="Anunciar próximos ônibus agora"
                className="hidden min-h-11 items-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 hover:bg-white/10 sm:inline-flex"
              >
                Anunciar
              </button>
            ) : null}
            <AccessibilitySettings
              voiceOn={voiceOn}
              voiceIntervalMinutes={voiceIntervalMinutes}
              onToggleVoice={onToggleVoice}
              onChangeVoiceInterval={onChangeVoiceInterval}
            />
          </div>
          <div className="text-right leading-tight">
            <p className="font-display text-4xl tabular-nums text-white">{timeStr}</p>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/60">
              {dateStr}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}


function NextBusesSection({ buses }: { buses: Bus[] }) {
  return (
    <section className="w-full grid-lines">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">
              Tempo real
            </p>
            <h1 className="font-display text-5xl leading-none tracking-wider text-white md:text-6xl">
              PRÓXIMOS ÔNIBUS
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 md:flex">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Atualizado agora
          </div>
        </div>

        <ul className="space-y-3">
          {buses.map((bus, i) => (
            <BusRow key={bus.line} bus={bus} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function BusRow({ bus, index }: { bus: Bus; index: number }) {
  const eta = formatEta(bus.etaSeconds);
  const isSoon = bus.etaSeconds < 5 * 60;
  return (
    <li
      className="animate-slide-up grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 md:gap-6 md:px-6 md:py-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={`grid h-16 w-20 place-items-center rounded-xl font-display text-3xl tracking-wider md:h-20 md:w-28 md:text-4xl ${
          isSoon ? "bg-mint text-navy-deep" : "bg-navy text-white"
        }`}
      >
        {bus.line}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Destino</p>
        <p className="truncate font-display text-2xl leading-tight tracking-wide text-white md:text-3xl">
          {bus.destination}
        </p>
      </div>
      <div className="flex items-baseline gap-1 text-right">
        <span
          className={`font-display text-5xl leading-none tabular-nums md:text-6xl ${
            isSoon ? "text-mint" : "text-white"
          }`}
        >
          {eta.big}
        </span>
        <span className="font-display text-lg tracking-widest text-white/60">{eta.unit}</span>
      </div>
    </li>
  );
}

function ArrivingHero({ bus }: { bus: Bus }) {
  const secs = bus.etaSeconds.toString().padStart(2, "0");
  return (
    <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-mint text-navy-deep">
      <div className="absolute inset-0 grid-lines opacity-20" />
      <div className="animate-pulse-arrive relative z-10 px-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.4em] md:text-base">
          Ônibus chegando ao ponto
        </p>
        <p className="mt-4 font-display text-[22vw] leading-none tracking-widest md:text-[14rem]">
          {bus.line}
        </p>
        <p className="font-display text-4xl tracking-wider md:text-6xl">CHEGANDO</p>
        <p className="mt-6 font-display text-7xl tabular-nums md:text-9xl">00:{secs}</p>
        <p className="mt-4 font-display text-xl tracking-wide md:text-3xl">
          {bus.destination}
        </p>
      </div>
    </section>
  );
}

function RotatorSection({ rotator }: { rotator: Rotator }) {
  return (
    <section className="w-full flex-1 border-t border-white/10 bg-navy-deep/40">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div key={JSON.stringify(rotator)} className="animate-slide-up">
          {rotator.kind === "alert" && <AlertCard r={rotator} />}
          {rotator.kind === "campaign" && <CampaignCard r={rotator} />}
          {rotator.kind === "event" && <EventCard r={rotator} />}
          {rotator.kind === "ad" && <AdCard r={rotator} />}
        </div>
      </div>
    </section>
  );
}

function AlertCard({ r }: { r: Extract<Rotator, { kind: "alert" }> }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-alert/40 bg-gradient-to-br from-alert/25 via-alert/10 to-transparent p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-alert text-white shadow-lg">
          <AlertTriangle className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-alert">
            Alerta Defesa Civil
          </p>
          <h2 className="mt-1 font-display text-4xl leading-tight tracking-wide text-white md:text-5xl">
            {r.title}
          </h2>
          <p className="mt-3 max-w-3xl text-lg font-medium text-white/85">{r.body}</p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2">
            <ShieldAlert className="h-5 w-5 text-alert" />
            <span className="text-sm font-semibold text-white/70">Defesa Civil</span>
            <span className="font-display text-3xl tabular-nums text-white">{r.phone}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CampaignCard({ r }: { r: Extract<Rotator, { kind: "campaign" }> }) {
  return (
    <article className="rounded-3xl border border-mint/30 bg-gradient-to-br from-mint/15 via-cyan/10 to-transparent p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-mint text-navy-deep">
          <Syringe className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-mint">{r.tag}</p>
          <h2 className="mt-1 font-display text-4xl leading-tight tracking-wide text-white md:text-5xl">
            {r.title}
          </h2>
          <p className="mt-3 max-w-3xl text-lg font-medium text-white/85">{r.body}</p>
          <p className="mt-4 font-display text-2xl tracking-wider text-mint">{r.when}</p>
        </div>
      </div>
    </article>
  );
}

function EventCard({ r }: { r: Extract<Rotator, { kind: "event" }> }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan/20 via-navy/40 to-transparent p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan text-white">
          <Calendar className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">{r.tag}</p>
          <h2 className="mt-1 font-display text-4xl leading-tight tracking-wide text-white md:text-5xl">
            {r.title}
          </h2>
          <p className="mt-3 text-lg font-medium text-white/85">{r.place}</p>
          <p className="mt-2 font-display text-2xl tracking-wider text-mint">{r.when}</p>
        </div>
      </div>
    </article>
  );
}

function AdCard({ r }: { r: Extract<Rotator, { kind: "ad" }> }) {
  return (
    <article className="flex items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">{r.tag}</p>
        <h2 className="mt-1 font-display text-4xl leading-tight tracking-wide text-white md:text-5xl">
          {r.title}
        </h2>
        <p className="mt-3 max-w-2xl text-lg font-medium text-white/85">{r.body}</p>
      </div>
      <div className="hidden shrink-0 flex-col items-center gap-2 rounded-2xl bg-white p-4 md:flex">
        <QrCode className="h-24 w-24 text-navy-deep" strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-deep">
          serra.es.gov.br
        </span>
      </div>
    </article>
  );
}

function BottomBar() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-navy-deep/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Wifi className="h-4 w-4 text-mint" />
          <span className="font-medium">Monitor #ML-042 · v2.4.1</span>
        </div>
        <div className="hidden overflow-hidden md:block">
          <div className="animate-marquee whitespace-nowrap text-xs font-medium uppercase tracking-[0.25em] text-white/50">
            Aponte a câmera do celular para o QR Code · Baixe o app ÔnibusGV · Denuncie irregularidades no portal 156 · Serra + Conectada · Prefeitura da Serra · &nbsp;&nbsp;&nbsp;
            Aponte a câmera do celular para o QR Code · Baixe o app ÔnibusGV · Denuncie irregularidades no portal 156 · Serra + Conectada · Prefeitura da Serra · &nbsp;&nbsp;&nbsp;
          </div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">
          Smart City · Serra
        </div>
      </div>
    </footer>
  );
}
