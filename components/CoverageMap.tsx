"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon, type DivIcon } from "leaflet";

import { formatCurrency } from "@/lib/content";
import type { ApartmentListing, Language } from "@/lib/types";

function createMarkerIcon(label: string, selected: boolean): DivIcon {
  return divIcon({
    className: "",
    html: `<div class="coverage-pin${selected ? " coverage-pin-active" : ""}">${label}</div>`,
    iconSize: [58, 32],
    iconAnchor: [29, 28],
    popupAnchor: [0, -24],
  });
}

function MapViewport({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  return null;
}

export function CoverageMap({
  center,
  apartments,
  selectedApartmentAddress,
  language,
  onApartmentSelect,
}: {
  center: { lat: number; lng: number };
  apartments: ApartmentListing[];
  selectedApartmentAddress: string | null;
  language: Language;
  onApartmentSelect: (apartment: ApartmentListing) => void;
}) {
  return (
    <div className="relative z-0 isolate overflow-hidden rounded-[1.8rem] border border-[var(--color-border)]">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="coverage-map h-[320px] w-full xl:h-[360px]"
      >
        <MapViewport lat={center.lat} lng={center.lng} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CircleMarker
          center={[center.lat, center.lng]}
          radius={11}
          pathOptions={{
            color: "#111827",
            fillColor: "#D4603A",
            fillOpacity: 0.95,
            weight: 3,
          }}
        >
          <Popup>
            {language === "es" ? "Tu ubicacion demo" : "Your demo location"}
          </Popup>
        </CircleMarker>

        {apartments.map((apartment) => {
          const isSelected = apartment.address === selectedApartmentAddress;

          return (
            <Marker
              key={`${apartment.name}-${apartment.address}`}
              position={[apartment.coordinates.lat, apartment.coordinates.lng]}
              icon={createMarkerIcon(`$${apartment.estimate}`, isSelected)}
              zIndexOffset={isSelected ? 800 : 0}
              eventHandlers={{
                click: () => onApartmentSelect(apartment),
              }}
            >
              <Popup>
                <div className="grid gap-1 text-sm">
                  <p className="font-semibold">{apartment.name}</p>
                  <p>{apartment.address}</p>
                  <p>
                    {formatCurrency(apartment.estimate, language)}
                    {language === "es"
                      ? "/mes de seguro de inquilino"
                      : "/mo renter&apos;s insurance"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
