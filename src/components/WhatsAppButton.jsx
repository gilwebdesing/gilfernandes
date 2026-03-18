import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeadTracking } from '@/hooks/useLeadTracking';
import { generateWhatsAppLink } from '@/utils/whatsappHelper';
import { cn } from '@/lib/utils';
import { validatePropertyData } from '@/utils/gaHelper';

const WhatsAppButton = ({ 
    property, 
    businessPhone = '5511971157373', 
    className,
    label = "Tenho Interesse",
    ...props
}) => {
  const { trackWhatsAppClick, isTracking } = useLeadTracking();

  if (!validatePropertyData(property)) {
    if (import.meta.env.DEV) console.warn("WhatsAppButton hidden due to invalid property data", property);
    return null;
  }

  const whatsappUrl = generateWhatsAppLink(property, businessPhone);

  const handleClick = () => {
    if (!property) return;
    trackWhatsAppClick(property, businessPhone);
  };

  return (
    <Button
      asChild
      className={cn(
        // Base styles
        "bg-white text-green-600 border border-green-500 font-medium",
        // Hover styles
        "hover:bg-green-600 hover:text-white hover:border-green-600",
        // Transitions
        "transition-colors duration-200",
        // Layout
        "flex items-center justify-center gap-2 h-10 text-base shadow-sm",
        // Disabled state
        isTracking && "opacity-40 cursor-not-allowed",
        className
      )}
      disabled={isTracking}
      {...props}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {isTracking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
        {label}
      </a>
    </Button>
  );
};

export default WhatsAppButton;