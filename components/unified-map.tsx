'use client';

import { Smoke } from '@/lib/services/smokes.service';
import { CRS, Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ImageOverlay, MapContainer, Marker, useMapEvents } from 'react-leaflet';
import { useMemo } from 'react';

// Fix para ícones do Leaflet no Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone customizado (nuvem de smoke em branco sobre fundo azul via CSS)
const smokeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="9" cy="13" r="4" fill="white"/><circle cx="13" cy="12" r="5" fill="white"/><circle cx="16" cy="15" r="3.5" fill="white"/></svg>',
  iconSize: [24, 24],
  // Account for 2px CSS border around the icon (24px + 2*2px = 28px)
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
  className: 'smoke-marker'
});

// Ícone destacado (mesmo desenho, tamanho maior; efeito adicional via CSS)
const smokeIconHighlighted = new Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="9" cy="13" r="4" fill="white"/><circle cx="13" cy="12" r="5" fill="white"/><circle cx="16" cy="15" r="3.5" fill="white"/></svg>',
  iconSize: [24, 24],
  // Same base anchor as default, but popup a bit higher to compensate 1.2x scale
  iconAnchor: [14, 14],
  popupAnchor: [0, -17],
  className: 'smoke-marker smoke-marker--highlighted'
});

interface UnifiedMapProps {
  radarImagePath: string;
  smokes: Smoke[];
  onSmokeClick: (smoke: Smoke) => void;
  className?: string;
  height?: string;
  width?: string;
  onMapClick?: (x_percent: number, y_percent: number) => void;
  tempPoint?: { x_coord: number; y_coord: number };
  highlightedSmokeId?: number | null;
}

export default function UnifiedMap({
  radarImagePath,
  smokes,
  onSmokeClick,
  className = '',
  height = '600px',
  width = '100%',
  onMapClick,
  tempPoint,
  highlightedSmokeId
}: UnifiedMapProps) {
  // Dimensões padrão da imagem (assumindo imagens quadradas de alta resolução)
  const imageSize = 1024;

  // Bounds da imagem usando sistema de coordenadas simples (memoizado para não refazer fit a cada render)
  const bounds = useMemo(() => new LatLngBounds(
    [0, 0],
    [imageSize, imageSize]
  ), [imageSize]);

  // Centro inicial memoizado para manter identidade estável entre renders
  const initialCenter = useMemo(() => [imageSize / 2, imageSize / 2] as [number, number], [imageSize]);

  // Converter coordenadas percentuais para coordenadas do mapa
  const convertToMapCoords = (xPercent: number, yPercent: number): [number, number] => {
    return [
      (yPercent / 100) * imageSize, // Inverter Y para corresponder ao sistema de coordenadas do mapa
      (xPercent / 100) * imageSize
    ];
  };

  // Converter coordenadas do mapa para percentuais (0-100)
  const convertToPercentCoords = (lat: number, lng: number): [number, number] => {
    const xPercent = (lng / imageSize) * 100;
    const yPercent = (lat / imageSize) * 100;
    return [xPercent, yPercent];
  };

  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        if (!onMapClick) return;
        const { lat, lng } = e.latlng;
        const [xPercent, yPercent] = convertToPercentCoords(lat, lng);
        // Clamp values between 0 and 100
        const clamp = (v: number) => Math.max(0, Math.min(100, v));
        onMapClick(Number(clamp(xPercent).toFixed(2)), Number(clamp(yPercent).toFixed(2)));
      },
    });
    return null;
  }

  return (
    <div className={`unified-map-container ${className}`} style={{ height, width }}>
      <MapContainer
        center={initialCenter}
        style={{ height: '100%', width: '100%' }}
        crs={CRS.Simple}
        bounds={bounds}
        scrollWheelZoom={false}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        minZoom={-2}
        maxZoom={3}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Imagem do radar como overlay */}
        <ImageOverlay
          url={radarImagePath}
          bounds={bounds}
          opacity={1}
        />

        {/* Captura de cliques no mapa para seleção de coordenadas */}
        {onMapClick ? <MapClickHandler /> : null}

        {/* Marcadores para smokes */}
        {smokes.map((smoke) => {
          const position = convertToMapCoords(smoke.x_coord, smoke.y_coord);

          return (
            <Marker
              key={smoke.id}
              position={position}
              icon={highlightedSmokeId === smoke.id ? smokeIconHighlighted : smokeIcon}
              zIndexOffset={highlightedSmokeId === smoke.id ? 1000 : 0}
              eventHandlers={{
                click: () => onSmokeClick(smoke),
              }}
            >
              {/* <Popup
                autoPan
                keepInView
                autoPanPaddingTopLeft={[16, 64]}
                autoPanPaddingBottomRight={[16, 16]}
              >
                <MapPopup
                  title={smoke.title}
                  author={smoke.author.displayName}
                  videoUrl={smoke.videoUrl}
                  onDetails={() => onSmokeClick(smoke)}
                />
              </Popup> */}
            </Marker>
          );
        })}

        {/* Marcador temporário para ponto selecionado */}
        {tempPoint ? (
          <Marker
            key="temp-point"
            position={convertToMapCoords(tempPoint.x_coord, tempPoint.y_coord)}
            icon={smokeIcon}
          />
        ) : null}
      </MapContainer>

      <style jsx global>{`
        .unified-map-container {
          position: relative;
          z-index: 0;
        }

        .smoke-marker {
          background: #3b82f6;
          border: 2px solid #ffffff;
          border-radius: 50%;
          width: 24px !important;
          height: 24px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
          position: relative;
        }
        
        .smoke-marker:hover {
          background: var(--color-primary);
          transform: scale(1.2);
          box-shadow: 0 4px 14px rgba(var(--color-primary), 0.6);
        }
        .smoke-marker--highlighted {
          background: var(--color-primary);
          transform: scale(1.2);
          box-shadow: 0 4px 14px rgba(var(--color-primary), 0.6);
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          background: var(--color-popover);
          color: var(--color-popover-foreground);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          box-shadow: none;
        }
        
        .leaflet-popup-tip {
          background: var(--color-popover);
          border: 1px solid var(--color-border);
        }
      `}</style>
    </div>
  );
}
