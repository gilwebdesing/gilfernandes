import React from 'react';
import { X, MapPin } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PropertyMarker from './PropertyMarker';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const PropertyMapModal = ({ isOpen, onClose, property, properties }) => {
  if (!isOpen) return null;

  // Determine which properties to display
  // Supports both single 'property' prop (for detail page) and 'properties' array (for list page)
  const displayProperties = properties || (property ? [property] : []);

  // Default to São Paulo center if no valid coordinates found
  const defaultCenter = [-23.550520, -46.633308];
  
  // Try to find a valid center from the first property with coordinates
  const validProperty = displayProperties.find(p => p.lat && p.lng);
  const center = validProperty 
    ? [Number(validProperty.lat), Number(validProperty.lng)] 
    : defaultCenter;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[95vw] h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a3a52] flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#ff8c42]" />
                {displayProperties.length > 1 ? 'Mapa de Imóveis' : 'Localização do Imóvel'}
              </h3>
              <div className="flex items-center gap-2">
                 {displayProperties.length > 1 && (
                     <span className="text-sm text-gray-500 mr-2 hidden sm:inline">
                         {displayProperties.length} imóveis encontrados
                     </span>
                 )}
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-gray-100 rounded-full h-10 w-10 transition-colors"
                >
                    <X className="w-6 h-6 text-gray-500" />
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative bg-gray-100">
               <MapContainer 
                    center={center} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {displayProperties.map((p) => (
                    <PropertyMarker key={p.id} property={p} />
                ))}

              </MapContainer>
            </div>
          </motion.div>

          {/* Close on click outside */}
          <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
      )}
    </AnimatePresence>
  );
};

export default PropertyMapModal;