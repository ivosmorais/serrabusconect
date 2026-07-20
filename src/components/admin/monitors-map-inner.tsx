import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import { useNavigate } from "@tanstack/react-router";
import "leaflet/dist/leaflet.css";
import type { Monitor } from "@/lib/admin-mock";

const colorFor = (s: Monitor["status"]) =>
  s === "online" ? "#10b981" : s === "manutencao" ? "#f59e0b" : "#ef4444";

const labelFor = (s: Monitor["status"]) =>
  s === "online" ? "Online" : s === "manutencao" ? "Em manutenção" : "Offline";

export default function MonitorsMapInner({ monitors }: { monitors: Monitor[] }) {
  const navigate = useNavigate();

  return (
    <MapContainer
      center={[-20.13, -40.25]}
      zoom={11}
      scrollWheelZoom
      className="h-[420px] w-full rounded-lg"
      style={{ background: "#0c2340" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      {monitors.map((m) => {
        const color = colorFor(m.status);
        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={11}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 3 }}
            eventHandlers={{
              dblclick: () => navigate({ to: "/admin/monitores" }),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 12 }}>
                <strong>{m.nome}</strong>
                <div style={{ color }}>{labelFor(m.status)}</div>
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: "system-ui, sans-serif", minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nome}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{m.endereco}</div>
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  Status: <strong style={{ color }}>{labelFor(m.status)}</strong>
                </div>
                <div style={{ fontSize: 12 }}>Sinal: {m.sinal}%</div>
                <div style={{ marginTop: 6, fontSize: 11, color: "#777" }}>
                  Clique 2× no ponto para gerenciar
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
