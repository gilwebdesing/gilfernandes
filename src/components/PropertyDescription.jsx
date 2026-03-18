import React from 'react';
import { cn } from '@/lib/utils';

const PropertyDescription = ({ html, className }) => {
  if (!html) return null;

  // Security Note:
  // ReactQuill generates safe HTML (no script tags).
  // dangerouslySetInnerHTML is used to render this rich text.
  // Tailwind 'prose' class handles the styling of the raw HTML elements.

  return (
    <div
      className={cn(
        // Base typography
        "prose max-w-none font-inter",
        "text-[1.05rem] leading-[1.85] text-gray-700",

        // Headings
        "prose-headings:text-[#1a3a52]",
        "prose-headings:font-semibold",
        "prose-headings:tracking-tight",
        "prose-headings:mb-3 prose-headings:mt-6",
        "prose-h2:text-2xl",
        "prose-h3:text-xl",

        // Paragraphs
        "prose-p:mb-4",
        "prose-p:leading-relaxed",

        // Strong / emphasis
        "prose-strong:text-gray-900",
        "prose-strong:font-semibold",

        // Lists
        "prose-ul:list-disc",
        "prose-ul:pl-5",
        "prose-ul:mb-4",
        "prose-li:mb-2",
        "prose-li:text-gray-700",

        // Remove ugly margins from last element
        "prose-p:last:mb-0",
        "prose-ul:last:mb-0",

        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default PropertyDescription;