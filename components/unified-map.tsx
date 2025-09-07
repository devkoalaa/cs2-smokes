'use client';

import { Smoke } from '@/lib/services/smokes.service';
import { CRS, Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ImageOverlay, MapContainer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MapPopup from './map-popup';

// Fix para ícones do Leaflet no Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Criar ícone customizado para smokes
const smokeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggNVYxOUwyMCAxMkw4IDVaIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik04IDVWMTlMMjAgMTJMODUgNSIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4K',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
  className: 'smoke-marker'
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
}

export default function UnifiedMap({
  radarImagePath,
  smokes,
  onSmokeClick,
  className = '',
  height = '600px',
  width = '100%',
  onMapClick,
  tempPoint
}: UnifiedMapProps) {
  // Dimensões padrão da imagem (assumindo imagens quadradas de alta resolução)
  const imageSize = 1024;

  // Bounds da imagem usando sistema de coordenadas simples
  const bounds = new LatLngBounds(
    [0, 0], // Southwest corner
    [imageSize, imageSize]  // Northeast corner
  );

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
        center={[imageSize / 2, imageSize / 2]}
        style={{ height: '100%', width: '100%' }}
        crs={CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        minZoom={-2}
        maxZoom={3}
        scrollWheelZoom={true}
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
              icon={smokeIcon}
            >
              <Popup>
                <MapPopup
                  title={smoke.title}
                  author={smoke.author.displayName}
                  videoUrl={smoke.videoUrl}
                  onDetails={() => onSmokeClick(smoke)}
                />
              </Popup>
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
        }
        
        .smoke-marker:hover {
          background: #2563eb;
          transform: scale(1.1);
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
