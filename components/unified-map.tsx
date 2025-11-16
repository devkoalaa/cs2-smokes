'use client';

import { Smoke, SmokeType } from '@/lib/services/smokes.service';
import { CRS, Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { ImageOverlay, MapContainer, Marker, useMapEvents } from 'react-leaflet';

// Fix para ícones do Leaflet no Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Função para criar ícones baseados no tipo de smoke
const createSmokeIcon = (type: SmokeType, highlighted: boolean = false) => {
  const size = highlighted ? 28 : 24;
  const anchor = highlighted ? 16 : 14;

  let svgContent = '';

  switch (type) {
    case SmokeType.SMOKE:
      svgContent = '<circle cx="9" cy="13" r="4" fill="white"/><circle cx="13" cy="12" r="5" fill="white"/><circle cx="16" cy="15" r="3.5" fill="white"/>';
      break;
    case SmokeType.BANG:
      svgContent = '<circle cx="12" cy="12" r="8" fill="white" stroke="orange" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="orange" stroke-width="2"/>';
      break;
    case SmokeType.MOLOTOV:
      svgContent = '<rect x="8" y="14" width="8" height="6" fill="brown"/><rect x="9" y="10" width="6" height="4" fill="orange"/><circle cx="12" cy="12" r="2" fill="red"/>';
      break;
    case SmokeType.STRATEGY:
      svgContent = '<rect x="6" y="6" width="12" height="12" fill="white" stroke="green" stroke-width="2"/><path d="M9 9h6M9 12h6M9 15h4" stroke="green" stroke-width="1.5"/>';
      break;
    default:
      svgContent = '<circle cx="9" cy="13" r="4" fill="white"/><circle cx="13" cy="12" r="5" fill="white"/><circle cx="16" cy="15" r="3.5" fill="white"/>';
  }

  return new Icon({
    iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${svgContent}</svg>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor],
    className: `smoke-marker smoke-marker--${type.toLowerCase()}${highlighted ? ' smoke-marker--highlighted' : ''}`
  });
};

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
          const isHighlighted = highlightedSmokeId === smoke.id;

          return (
            <Marker
              key={smoke.id}
              position={position}
              icon={createSmokeIcon(smoke.type, isHighlighted)}
              zIndexOffset={isHighlighted ? 1000 : 0}
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
            icon={createSmokeIcon(SmokeType.SMOKE, false)}
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
        
        .smoke-marker--smoke {
          background: #3b82f6; /* Azul para smoke */
        }
        
        .smoke-marker--bang {
          background: #f59e0b; /* Laranja para flashbang */
        }
        
        .smoke-marker--molotov {
          background: #dc2626; /* Vermelho para molotov */
        }
        
        .smoke-marker--strategy {
          background: #16a34a; /* Verde para estratégia */
        }
        
        .smoke-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        
        .smoke-marker--highlighted {
          transform: scale(1.2);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
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
