import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  MonitorSmartphone,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MONITORES,
  PONTOS_MOVIMENTADOS,
  ALERTAS_ATIVOS,
} from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const online = MONITORES.filter((m) => m.status === "online").length;
  const offline = MONITORES.filter((m) => m.status === "offline").length;
  const total = MONITORES.length;
  const uptime = Math.round((online / total) * 100);
  const maxPassageiros = Math.max(...PONTOS_MOVIMENTADOS.map((p) => p.passageiros));

  const kpis = [
    { label: "Monitores online", value: `${online}/${total}`, icon: Wifi, tone: "text-mint" },
    { label: "Monitores offline", value: `${offline}`, icon: WifiOff, tone: "text-alert" },
    { label: "Tempo médio de espera", value: "6m 42s", icon: Clock, tone: "text-cyan" },
    { label: "Alertas ativos", value: `${ALERTAS_ATIVOS.length}`, icon: AlertTriangle, tone: "text-warning" },
    { label: "Receita de publicidade (mês)", value: "R$ 84.320", icon: DollarSign, tone: "text-mint" },
    { label: "Passageiros hoje", value: "42.180", icon: Users, tone: "text-cyan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-white">Dashboard</h1>
        <p className="text-sm text-white/60">Indicadores em tempo real da rede Serra SmartBus.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="border-white/10 bg-white/5 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div className="mt-2 font-display text-3xl">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 text-mint" /> Mapa em tempo real
            </CardTitle>
            <Badge className="bg-mint/20 text-mint">{uptime}% online</Badge>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 overflow-hidden rounded-lg border border-white/10 bg-navy-deep grid-lines">
              {MONITORES.map((m) => {
                const x = ((m.lng + 40.32) / 0.15) * 100;
                const y = ((-20.02 - m.lat) / -0.22) * 100;
                const color =
                  m.status === "online" ? "bg-mint" : m.status === "offline" ? "bg-alert" : "bg-warning";
                return (
                  <div
                    key={m.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${Math.min(95, Math.max(5, x))}%`, top: `${Math.min(90, Math.max(10, y))}%` }}
                    title={`${m.nome} — ${m.status}`}
                  >
                    <div className={`h-3 w-3 rounded-full ${color} ring-4 ring-white/10`} />
                    <div className="mt-1 whitespace-nowrap rounded bg-navy-deep/80 px-1.5 py-0.5 text-[10px] text-white/80">
                      {m.nome}
                    </div>
                  </div>
                );
              })}
              <div className="absolute bottom-3 left-3 flex gap-3 rounded-md bg-navy-deep/70 px-3 py-2 text-xs">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-mint" /> Online</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Manutenção</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-alert" /> Offline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alertas ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ALERTAS_ATIVOS.map((a) => (
              <div key={a.id} className="rounded-lg border border-white/10 bg-navy-deep/60 p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-warning/40 text-warning">{a.tipo}</Badge>
                  <span className="text-xs text-white/50">{a.inicio}</span>
                </div>
                <div className="mt-2 text-sm font-semibold">{a.titulo}</div>
                <div className="text-xs text-white/60">{a.regiao}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-mint" /> Pontos mais movimentados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PONTOS_MOVIMENTADOS.map((p) => (
              <div key={p.nome} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{p.nome}</span>
                  <span className="text-white/60">{p.passageiros.toLocaleString("pt-BR")} pass.</span>
                </div>
                <Progress value={(p.passageiros / maxPassageiros) * 100} className="h-2 bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-4 w-4 text-cyan" /> Saúde da rede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm"><span>Disponibilidade geral</span><span>{uptime}%</span></div>
              <Progress value={uptime} className="mt-1 h-2 bg-white/10" />
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Sinal médio</span><span>{Math.round(MONITORES.reduce((s, m) => s + m.sinal, 0) / total)}%</span></div>
              <Progress value={Math.round(MONITORES.reduce((s, m) => s + m.sinal, 0) / total)} className="mt-1 h-2 bg-white/10" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <StatBox icon={MonitorSmartphone} label="Total" value={`${total}`} />
              <StatBox icon={Wifi} label="Online" value={`${online}`} tone="text-mint" />
              <StatBox icon={WifiOff} label="Offline" value={`${offline}`} tone="text-alert" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, tone = "text-white" }: { icon: typeof Activity; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-navy-deep/60 p-3">
      <Icon className={`h-4 w-4 ${tone}`} />
      <div className="mt-1 font-display text-2xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}
