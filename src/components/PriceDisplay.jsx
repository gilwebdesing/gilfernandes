import React, { useMemo } from 'react';
import { formatPrice } from '@/utils/seoHelpers';
import { cn } from '@/lib/utils';

/**
 * Component to intelligently display property price
 * Handles sale vs rent logic and font sizing
 */
const PriceDisplay = ({ 
  price, 
  rentalPrice, 
  businessType, 
  startingFromPrice, 
  className 
}) => {
  const isRent = businessType === 'rent';
  
  // Determine which price value to use
  // Priority: Starting Price > Rental Price (if rent) > Sale Price
  const displayPrice = startingFromPrice || (isRent ? rentalPrice : price);
  
  // Memoize formatting to prevent recalculation on every render
  const formattedString = useMemo(() => 
    formatPrice(displayPrice, isRent), 
  [displayPrice, isRent]);

  // Determine font size based on number of digits
  // Fewer digits = Larger font
  const numericLength = formattedString.replace(/\D/g, '').length;
  const fontSizeClass = numericLength > 9 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl';

  // Split integer and decimal parts for styling
  // Removes 'R$' and '/ mês' to handle layout manually
  const priceClean = formattedString.replace('R$', '').replace('/ mês', '').trim();
  const [integerPart, decimalPart] = priceClean.split(',');

  return (
    <div className={cn("flex justify-center items-end gap-1 whitespace-nowrap overflow-hidden text-gray-900", className)}>
        <span className="text-2xl font-extrabold">R$</span>
        <span className={cn("font-extrabold tracking-tight", fontSizeClass)}>
            {integerPart}
        </span>
        {decimalPart && (
            <span className="text-2xl text-gray-800 mb-1 font-bold">
                ,{decimalPart}
            </span>
        )}
        {/* Re-add the /mês suffix if needed */}
        {isRent && <span className="text-lg text-gray-600 mb-1 ml-1 font-medium">/ mês</span>}
    </div>
  );
};

export default PriceDisplay;