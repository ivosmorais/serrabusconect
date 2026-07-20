import { lazy, Suspense, useEffect, useState } from "react";
import type { Monitor } from "@/lib/admin-mock";

const Inner = lazy(() => import("./monitors-map-inner"));

const Fallback = () => (
  <div className="flex h-[420px] w-full items-center justify-center rounded-lg border border-white/10 bg-navy-deep/60 text-sm text-white/50">
    Carregando mapa...
  </div>
);

export function MonitorsMap({ monitors }: { monitors: Monitor[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Fallback />;
  return (
    <Suspense fallback={<Fallback />}>
      <Inner monitors={monitors} />
    </Suspense>
  );
}
