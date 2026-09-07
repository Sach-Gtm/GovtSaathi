"use client";
import { useEffect, useRef } from "react";

export interface MapPin {
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  status: "planned" | "in_progress" | "done" | "missed";
}

const STATUS_COLOR: Record<MapPin["status"], string> = {
  planned: "#0B5FFF",
  in_progress: "#E37400",
  done: "#0F9D58",
  missed: "#D14343"
};

/**
 * OpenStreetMap-backed field map using Leaflet. Client-only. Draws a pin per
 * shop coloured by visit status and a dashed route line in planned order.
 */
export function FieldMap({ pins, height = 420 }: { pins: MapPin[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      // Inject Leaflet CSS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }
      if (cancelled || !ref.current) return;

      const valid = pins.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
      const center: [number, number] = valid.length
        ? [valid[0].lat, valid[0].lng]
        : [22.9734, 78.6569]; // Centre of India as a fallback

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, valid.length ? 12 : 5);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);

      const bounds: [number, number][] = [];
      valid.forEach((p, i) => {
        const color = STATUS_COLOR[p.status];
        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative">
            <div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff"></div>
            <div style="position:absolute;top:5px;left:8px;color:#fff;font:700 11px system-ui;transform:rotate(0)">${i + 1}</div>
          </div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26]
        });
        L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${p.label}</b>${p.sub ? `<br/>${p.sub}` : ""}<br/><span style="color:${color}">${p.status.replace("_", " ")}</span>`);
        bounds.push([p.lat, p.lng]);
      });

      if (bounds.length > 1) {
        L.polyline(bounds, { color: "#0B1220", weight: 2, dashArray: "6 6", opacity: 0.5 }).addTo(map);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pins]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div ref={ref} style={{ height, width: "100%", background: "#eef2f4" }} />
    </div>
  );
}
