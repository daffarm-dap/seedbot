import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { Trash2, MapPin, Satellite } from "lucide-react";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Component to handle map events for drawing
function DrawingHandler({ onDrawComplete, isDrawing, drawingPoints, setDrawingPoints }) {
  useMapEvents({
    click(e) {
      if (isDrawing && e && e.latlng) {
        try {
          const newPoint = [e.latlng.lat, e.latlng.lng];
          const newPoints = [...(drawingPoints || []), newPoint];
          setDrawingPoints(newPoints);
          // Call onDrawComplete immediately to update parent
          if (onDrawComplete) {
            onDrawComplete(newPoints);
          }
        } catch (error) {
          console.error("Error handling map click:", error);
        }
      }
    },
  });

  if (!drawingPoints || !Array.isArray(drawingPoints) || drawingPoints.length === 0) {
    return null;
  }

  return (
    <>
      {drawingPoints.length > 1 && (
        <Polyline
          positions={drawingPoints
            .map((p) => {
              if (Array.isArray(p) && p.length >= 2) {
                const lat = parseFloat(p[0]);
                const lng = parseFloat(p[1]);
                if (!isNaN(lat) && !isNaN(lng)) {
                  return [lat, lng];
                }
              }
              return null;
            })
            .filter(Boolean)}
          color="#10b981"
          weight={3}
          opacity={0.8}
          dashArray="10, 10"
        />
      )}
      {drawingPoints.map((point, index) => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const lat = parseFloat(point[0]);
        const lng = parseFloat(point[1]);
        if (isNaN(lat) || isNaN(lng)) return null;
        
        return (
          <Marker
            key={`draw-${index}`}
            position={[lat, lng]}
            icon={L.icon({
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>Point {index + 1}</Popup>
          </Marker>
        );
      })}
    </>
  );
}

// Component to display saved mappings
function SavedMappingsLayer({ mappings, onMappingClick, selectedMappingId }) {
  if (!mappings || mappings.length === 0) return null;

  return (
    <>
      {mappings.map((mapping) => {
        if (!mapping.coordinates) return null;
        
        try {
          let coords = mapping.coordinates;
          
          // Parse if it's a string
          if (typeof coords === 'string') {
            try {
              coords = JSON.parse(coords);
            } catch (e) {
              console.error("Error parsing coordinates string:", e);
              return null;
            }
          }
          
          // Ensure it's an array
          if (!Array.isArray(coords) || coords.length === 0) return null;

          // Convert coordinates to Leaflet format [lat, lng]
          const positions = coords
            .map((coord) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                // Ensure lat, lng order
                return [parseFloat(coord[0]), parseFloat(coord[1])];
              }
              return null;
            })
            .filter((pos) => pos !== null && !isNaN(pos[0]) && !isNaN(pos[1]));

          if (positions.length === 0) return null;

          const isSelected = selectedMappingId === mapping.id;
          
          return (
            <Polyline
              key={mapping.id}
              positions={positions}
              color={isSelected ? "#ef4444" : "#3b82f6"}
              weight={isSelected ? 4 : 3}
              opacity={0.8}
              eventHandlers={{
                click: () => {
                  if (onMappingClick) {
                    onMappingClick(mapping.id);
                  }
                },
              }}
            >
              <Popup>
                <div>
                  <p className="font-semibold">{mapping.name || mapping.mappingName}</p>
                  <p className="text-xs text-gray-500">{mapping.date || mapping.createdAt}</p>
                  <p className="text-xs text-gray-400 mt-1">{positions.length} titik</p>
                </div>
              </Popup>
            </Polyline>
          );
        } catch (error) {
          console.error("Error parsing coordinates for mapping:", mapping.id, error);
          return null;
        }
      })}
    </>
  );
}

// Map controls component - rendered inside MapContainer
function MapControls({ onZoomIn, onZoomOut, onResetView, onToggleDrawing, isDrawing, onToggleMapType, mapType }) {
  return (
    <div 
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'auto',
        backgroundColor: 'transparent'
      }}
      className="leaflet-map-controls"
    >
      <Button
        size="icon"
        variant="secondary"
        className="bg-white hover:bg-slate-100 shadow-lg border border-gray-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onZoomIn();
        }}
        title="Zoom In"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="bg-white hover:bg-slate-100 shadow-lg border border-gray-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onZoomOut();
        }}
        title="Zoom Out"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="bg-white hover:bg-slate-100 shadow-lg border border-gray-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onResetView();
        }}
        title="Reset View"
        type="button"
      >
        <MapPin className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant={isDrawing ? "default" : "secondary"}
        className={isDrawing ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg" : "bg-white hover:bg-slate-100 shadow-lg border border-gray-200"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleDrawing();
        }}
        title={isDrawing ? "Stop Drawing" : "Start Drawing"}
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </Button>
      <Button
        size="icon"
        variant={mapType === "satellite" ? "default" : "secondary"}
        className={mapType === "satellite" ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg" : "bg-white hover:bg-slate-100 shadow-lg border border-gray-200"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleMapType();
        }}
        title={mapType === "satellite" ? "Mode Normal" : "Mode Satelit"}
        type="button"
      >
        <Satellite className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Helper function to calculate center and bounds from coordinates
function calculateCenterAndZoom(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return { center: [-7.7956, 110.3695], zoom: 13 }; // Default: Yogyakarta
  }

  try {
    // Ensure coordinates are in [lat, lng] format
    let coords = coordinates;
    if (typeof coordinates[0] === 'number' && coordinates.length % 2 === 0) {
      // Flat array, convert to [lat, lng] pairs
      coords = [];
      for (let i = 0; i < coordinates.length; i += 2) {
        coords.push([parseFloat(coordinates[i]), parseFloat(coordinates[i + 1])]);
      }
    }

    if (coords.length === 0) {
      return { center: [-7.7956, 110.3695], zoom: 13 };
    }

    // Calculate bounds
    let minLat = coords[0][0];
    let maxLat = coords[0][0];
    let minLng = coords[0][1];
    let maxLng = coords[0][1];

    coords.forEach((coord) => {
      if (Array.isArray(coord) && coord.length >= 2) {
        const lat = parseFloat(coord[0]);
        const lng = parseFloat(coord[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        }
      }
    });

    // Calculate center
    const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

    // Calculate zoom based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 13; // Default zoom
    if (maxDiff > 0) {
      if (maxDiff > 1) zoom = 8;
      else if (maxDiff > 0.5) zoom = 9;
      else if (maxDiff > 0.2) zoom = 10;
      else if (maxDiff > 0.1) zoom = 11;
      else if (maxDiff > 0.05) zoom = 12;
      else if (maxDiff > 0.02) zoom = 13;
      else if (maxDiff > 0.01) zoom = 14;
      else zoom = 15;
    }

    return { center, zoom };
  } catch (error) {
    console.error("Error calculating center:", error);
    return { center: [-7.7956, 110.3695], zoom: 13 };
  }
}

export function LeafletMap({
  height = "500px",
  onCoordinatesChange,
  savedMappings = [],
  onMappingClick,
  selectedMappingId = null,
  initialCenter = [-7.7956, 110.3695], // Default: Yogyakarta, Indonesia
  initialZoom = 13,
  initialCoordinates = null, // For editing existing mappings
}) {
  const [map, setMap] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode
  const [mapType, setMapType] = useState("normal"); // "normal" or "satellite"

  // Ensure component is mounted and window is available before rendering map (fixes SSR/hydration issues)
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => {
        clearTimeout(timer);
        setIsMounted(false);
      };
    }
  }, []);

  // Load initial coordinates when provided (for editing)
  useEffect(() => {
    if (initialCoordinates) {
      try {
        // Parse coordinates if it's a string
        let coords = initialCoordinates;
        if (typeof initialCoordinates === 'string') {
          coords = JSON.parse(initialCoordinates);
        }
        
        // Ensure it's an array
        if (Array.isArray(coords) && coords.length > 0) {
          let formattedCoords = [];
          
          // Check if it's array of [lat, lng] pairs
          if (Array.isArray(coords[0])) {
            // Already in correct format
            formattedCoords = coords;
          } else if (typeof coords[0] === 'number' && coords.length % 2 === 0) {
            // Flat array, convert to [lat, lng] pairs
            for (let i = 0; i < coords.length; i += 2) {
              formattedCoords.push([parseFloat(coords[i]), parseFloat(coords[i + 1])]);
            }
          }

          if (formattedCoords.length > 0) {
            setDrawingPoints(formattedCoords);
            if (onCoordinatesChange) {
              onCoordinatesChange(formattedCoords);
            }
            setIsDrawing(true);
            setIsEditMode(true); // We're in edit mode

            // Calculate center and zoom from coordinates (only in edit mode)
            const { center, zoom } = calculateCenterAndZoom(formattedCoords);
            setMapCenter(center);
            setMapZoom(zoom);
          } else {
            // Empty or invalid, clear
            setDrawingPoints([]);
            setIsDrawing(false);
            setMapCenter(initialCenter);
            setMapZoom(initialZoom);
            if (onCoordinatesChange) {
              onCoordinatesChange([]);
            }
          }
        } else {
          // Empty or invalid, clear
          setDrawingPoints([]);
          setIsDrawing(false);
          setMapCenter(initialCenter);
          setMapZoom(initialZoom);
          if (onCoordinatesChange) {
            onCoordinatesChange([]);
          }
        }
      } catch (error) {
        console.error("Error parsing initial coordinates:", error);
        setDrawingPoints([]);
        setIsDrawing(false);
        setMapCenter(initialCenter);
        setMapZoom(initialZoom);
        if (onCoordinatesChange) {
          onCoordinatesChange([]);
        }
      }
    } else {
      // Clear if null or undefined (not in edit mode)
      setDrawingPoints([]);
      setIsDrawing(false);
      setIsEditMode(false); // Not in edit mode
      setMapCenter(initialCenter);
      setMapZoom(initialZoom);
      if (onCoordinatesChange) {
        onCoordinatesChange([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCoordinates]);

  const handleDrawComplete = (points) => {
    if (onCoordinatesChange) {
      onCoordinatesChange(points);
    }
  };

  const handleToggleDrawing = () => {
    if (isDrawing) {
      // Finish drawing - keep points
      setIsDrawing(false);
    } else {
      // Start drawing - clear previous points
      setDrawingPoints([]);
      setIsDrawing(true);
      if (onCoordinatesChange) {
        onCoordinatesChange([]);
      }
    }
  };

  const handleClearDrawing = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
    if (onCoordinatesChange) {
      onCoordinatesChange([]);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      // Use current map center and zoom (which may have been adjusted for editing)
      mapRef.current.setView(mapCenter, mapZoom, { animate: true });
    }
  };

  const handleToggleMapType = () => {
    setMapType(mapType === "normal" ? "satellite" : "normal");
  };

  // Component to get map instance
  function MapInstance({ setMapInstance }) {
    const map = useMap();
    useEffect(() => {
      try {
        setMapInstance(map);
        mapRef.current = map;
      } catch (error) {
        console.error("Error setting map instance:", error);
        setMapError(error.message);
      }
    }, [map, setMapInstance]);
    return null;
  }

  // Component to update map view when center/zoom changes (only in edit mode)
  function ChangeView({ center, zoom, shouldUpdate }) {
    const map = useMap();
    useEffect(() => {
      // Only update view if we're in edit mode (shouldUpdate is true)
      if (shouldUpdate && center && zoom && map) {
        map.setView(center, zoom, { animate: true });
      }
    }, [center, zoom, map, shouldUpdate]);
    return null;
  }

  // Show loading state if not mounted or window not available
  if (!isMounted || typeof window === 'undefined') {
    return (
      <div style={{ height, width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Memuat peta...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div style={{ height, width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
        <div className="text-center p-4">
          <p className="text-sm text-red-600 font-medium">Error memuat peta</p>
          <p className="text-xs text-red-500 mt-1">{mapError}</p>
          <button
            onClick={() => {
              setMapError(null);
              setIsMounted(false);
              setTimeout(() => setIsMounted(true), 100);
            }}
            className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div 
        style={{ 
          height, 
          width: "100%", 
          position: "relative",
          minHeight: "500px",
          backgroundColor: "#f3f4f6",
          isolation: 'isolate'
        }}
        className="leaflet-container-wrapper"
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ 
            height: "100%", 
            width: "100%", 
            position: "relative",
            zIndex: 1,
            pointerEvents: 'auto'
          }}
          className="leaflet-map-container"
          whenCreated={(mapInstance) => {
            try {
              if (mapInstance) {
                setMap(mapInstance);
                mapRef.current = mapInstance;
                // Force map to invalidate size after a short delay
                setTimeout(() => {
                  if (mapInstance && typeof mapInstance.invalidateSize === 'function') {
                    mapInstance.invalidateSize();
                  }
                }, 200);
              }
            } catch (error) {
              console.error("Error creating map:", error);
              setMapError(error.message || "Gagal membuat peta");
            }
          }}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          {mapType === "normal" ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={3}
              noWrap={false}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              minZoom={3}
              noWrap={false}
            />
          )}
          
          <MapInstance setMapInstance={setMap} />
          <ChangeView center={mapCenter} zoom={mapZoom} shouldUpdate={isEditMode} />
          
          {/* Drawing Handler */}
          <DrawingHandler
            onDrawComplete={handleDrawComplete}
            isDrawing={isDrawing}
            drawingPoints={drawingPoints}
            setDrawingPoints={setDrawingPoints}
          />
          
          {/* Saved Mappings Layer */}
          <SavedMappingsLayer
            mappings={savedMappings}
            onMappingClick={onMappingClick}
            selectedMappingId={selectedMappingId}
          />
          
          {/* Map Controls - Inside MapContainer */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onToggleDrawing={handleToggleDrawing}
            isDrawing={isDrawing}
            onToggleMapType={handleToggleMapType}
            mapType={mapType}
          />
        </MapContainer>
        
        {/* Drawing Instructions */}
        {isDrawing && (
          <div 
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 2000,
              pointerEvents: 'auto'
            }}
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-emerald-200"
          >
            <p className="text-sm text-emerald-700 font-medium">
              Mode Drawing Aktif
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Klik pada peta untuk menambahkan titik. Klik tombol drawing lagi untuk selesai.
            </p>
            {drawingPoints.length > 0 && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {drawingPoints.length} titik telah ditambahkan
              </p>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error rendering map:", error);
    setMapError(error.message || "Error rendering map");
    return (
      <div style={{ height, width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
        <div className="text-center p-4">
          <p className="text-sm text-red-600 font-medium">Error memuat peta</p>
          <p className="text-xs text-red-500 mt-1">{error.message || "Terjadi kesalahan saat memuat peta"}</p>
          <button
            onClick={() => {
              setMapError(null);
              setIsMounted(false);
              setTimeout(() => {
                setIsMounted(true);
              }, 100);
            }}
            className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }
}

