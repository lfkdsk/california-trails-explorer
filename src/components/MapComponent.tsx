import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, CircularProgress, Paper, Rating, Button } from '@mui/material';
import { Link } from 'react-router-dom';

// Define the center of California
const DEFAULT_CENTER = {
  lat: 37.8,
  lng: -119.5,
};

const DEFAULT_ZOOM = 6;

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface MapComponentProps {
  locations: any[];
  height?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
  onMarkerClick?: (trail: any) => void;
  selectedTrail?: any;
}

// Extend Window interface to include MarkerClusterer
declare global {
  interface Window {
    MarkerClusterer?: any;
    SuperClusterAlgorithm?: any;
  }
}

interface MarkerClusterer {
  addMarker: (marker: google.maps.Marker, noDraw?: boolean) => void;
  clearMarkers: () => void;
  removeMarker: (marker: google.maps.Marker) => boolean;
}

const MapComponent = ({
  locations,
  height = '500px',
  zoom = DEFAULT_ZOOM,
  center = DEFAULT_CENTER,
  onMarkerClick,
  selectedTrail,
}: MapComponentProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'visualization'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<any | null>(selectedTrail || null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLng | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);

  // Load MarkerClusterer script
  useEffect(() => {
    if (isLoaded && !window.MarkerClusterer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isLoaded]);

  // Update active marker when selectedTrail changes
  useEffect(() => {
    if (selectedTrail) {
      setActiveMarker(selectedTrail);
      if (map) {
        map.panTo({ lat: selectedTrail.Latitude, lng: selectedTrail.Longitude });
        map.setZoom(14);
      }
    }
  }, [selectedTrail, map]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Create markers when map and locations are available
  useEffect(() => {
    if (isLoaded && map && locations.length > 0 && window.MarkerClusterer) {
      // Clear existing markers
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];

      // Create new markers
      const newMarkers = locations.map((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.Latitude, lng: location.Longitude },
          map,
          title: location.Trail_Name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getDifficultyColor(location.Difficulty_Category),
            fillOpacity: 0.7,
            strokeWeight: 1,
            strokeColor: '#FFFFFF',
          },
        });

        marker.addListener('click', () => {
          setActiveMarker(location);
          setInfoWindowPosition(marker.getPosition() || null);
          if (onMarkerClick) {
            onMarkerClick(location);
          }
        });

        return marker;
      });

      markersRef.current = newMarkers;

      // Initialize MarkerClusterer
      if (window.MarkerClusterer && newMarkers.length > 0) {
        markerClustererRef.current = new window.MarkerClusterer({
          map,
          markers: newMarkers,
          algorithm: new window.SuperClusterAlgorithm({
            radius: 100,
            maxZoom: 15,
          }),
        });
      }

      // If there's a selected trail, set it as active marker
      if (selectedTrail) {
        setActiveMarker(selectedTrail);
        setInfoWindowPosition(
          new google.maps.LatLng(selectedTrail.Latitude, selectedTrail.Longitude)
        );
      }
    }
  }, [isLoaded, map, locations, onMarkerClick, selectedTrail]);

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
    setInfoWindowPosition(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return '#4CAF50'; // Green
      case '中等':
        return '#2196F3'; // Blue
      case '困难':
        return '#FF9800'; // Orange
      case '极难':
        return '#F44336'; // Red
      default:
        return '#9C27B0'; // Purple
    }
  };

  if (loadError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">地图加载失败，请稍后再试</Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          styles: [
            {
              featureType: 'poi.park',
              elementType: 'geometry.fill',
              stylers: [{ color: '#c8e6c9' }],
            },
            {
              featureType: 'landscape.natural',
              elementType: 'geometry.fill',
              stylers: [{ color: '#e8f5e9' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#bbdefb' }],
            },
          ],
        }}
      >
        {activeMarker && infoWindowPosition && (
          <InfoWindow
            position={infoWindowPosition}
            onCloseClick={handleInfoWindowClose}
            options={{ maxWidth: 300 }}
          >
            <Paper sx={{ p: 1, maxWidth: 280 }}>
              <Typography variant="subtitle1" gutterBottom>
                {activeMarker.Trail_Name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {activeMarker.Area}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={activeMarker.Rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {activeMarker.Rating?.toFixed(1)} ({activeMarker.Review_Count})
                </Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>距离:</strong> {activeMarker.Distance?.toFixed(1)} 英里
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>海拔增益:</strong> {activeMarker.Elevation_Gain?.toFixed(0)} 英尺
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>难度:</strong> {activeMarker.Difficulty_Category}
              </Typography>
              <Button
                component={Link}
                to={`/details/${activeMarker.Unique_Id}`}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              >
                查看详情
              </Button>
            </Paper>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 1,
          p: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          难度级别:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                mr: 0.5,
              }}
            />
            <Typography variant="caption">简单</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#2196F3',
                mr: 0.5,
              }}
            />
            <Typography variant="caption">中等</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#FF9800',
                mr: 0.5,
              }}
            />
            <Typography variant="caption">困难</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#F44336',
                mr: 0.5,
              }}
            />
            <Typography variant="caption">极难</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MapComponent;