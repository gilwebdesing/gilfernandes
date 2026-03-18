import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import PropertyMarker from './PropertyMarker';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues in React/Vite
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map center dynamically
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

const MapComponent = ({ properties = [], center = [-15.7942, -47.8822], zoom = 4, className = "h-full w-full", singleMarker = null }) => {
  
  // If we have a single marker (e.g. preview mode), use that
  const displayProperties = singleMarker ? [singleMarker] : properties;

  return (
    <div className={`${className} rounded-lg overflow-hidden shadow-inner border border-gray-200`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {displayProperties.map((property) => (
          <PropertyMarker key={property.id || 'preview'} property={property} />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;