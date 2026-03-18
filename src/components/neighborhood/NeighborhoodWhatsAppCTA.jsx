import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateWhatsAppLink } from '@/utils/whatsappHelper';
import { useNeighborhoodTracking } from '@/hooks/useNeighborhoodTracking';
import { cn } from '@/lib/utils';

const NeighborhoodWhatsAppCTA = ({ neighborhoodData, className }) => {
    const { trackWhatsAppClick } = useNeighborhoodTracking(neighborhoodData);
    const businessPhone = '5511971157373'; // Should ideally come from config

    const handleClick = () => {
        trackWhatsAppClick('general'); // General inquiry context
        
        const message = `Olá! Tenho interesse em imóveis em ${neighborhoodData?.name}. Pode me ajudar?`;
        // Manually construct link since generateWhatsAppLink usually takes a property object
        const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(url, '_blank');
    };

    if (!neighborhoodData) return null;

    return (
        <div className={cn("fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500", className)}>
            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 max-w-xs hidden md:block mb-4 relative">
                 <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                 <p className="text-sm text-gray-700 font-medium">
                     Fale com um especialista em <strong>{neighborhoodData.name}</strong> agora!
                 </p>
            </div>
            
            <Button 
                onClick={handleClick}
                className="w-full md:w-auto h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl flex items-center justify-center gap-3 px-6 transition-transform hover:scale-105"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="font-bold text-lg hidden md:inline">WhatsApp</span>
                <span className="font-bold md:hidden">Falar no WhatsApp</span>
            </Button>
        </div>
    );
};

export default NeighborhoodWhatsAppCTA;