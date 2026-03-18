import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Data & Helpers
import { fetchNeighborhoodBySlug, fetchPropertiesByNeighborhood } from '@/lib/neighborhoodData';
import { 
    generateNeighborhoodContent, 
    generateNeighborhoodFAQ, 
    generateNeighborhoodSchema, 
    generateNeighborhoodFAQSchema,
    generateNeighborhoodSEO 
} from '@/utils/neighborhoodContentGenerator';

// Components
import NeighborhoodHero from '@/components/neighborhood/NeighborhoodHero';
import NeighborhoodContent from '@/components/neighborhood/NeighborhoodContent';
import PropertyListByNeighborhood from '@/components/neighborhood/PropertyListByNeighborhood';
import NeighborhoodWhatsAppCTA from '@/components/neighborhood/NeighborhoodWhatsAppCTA';
import NeighborhoodContactForm from '@/components/neighborhood/NeighborhoodContactForm';
import { useNeighborhoodTracking } from '@/hooks/useNeighborhoodTracking';

const NeighborhoodPage = () => {
    const { neighborhoodSlug } = useParams();
    const { toast } = useToast();
    
    const [neighborhood, setNeighborhood] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Initialize tracking hook (will track pageview automatically when neighborhood is set)
    useNeighborhoodTracking(neighborhood ? { ...neighborhood, properties } : null);

    useEffect(() => {
        if (neighborhoodSlug) {
            loadPageData();
        }
    }, [neighborhoodSlug]);

    const loadPageData = async () => {
        setLoading(true);
        setError(false);

        try {
            // 1. Fetch Neighborhood Record
            let neighborhoodData = await fetchNeighborhoodBySlug(neighborhoodSlug);
            
            // 2. Derive name from slug if record doesn't exist yet (for robust fallback/on-the-fly creation)
            // Slug format: "vila-mariana" -> "Vila Mariana"
            const derivedName = neighborhoodSlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // 3. Fetch Properties (using derived name to find matches)
            const props = await fetchPropertiesByNeighborhood(neighborhoodData?.name || derivedName);
            setProperties(props);

            // 4. Handle "Just-in-Time" Content Generation
            if (!neighborhoodData) {
                // If we found properties but no neighborhood record, we can treat this as a valid page
                // In a real app, we might want to auto-create the record here. 
                // For now, we construct a temporary object to render the page.
                if (props.length > 0) {
                     neighborhoodData = {
                         name: derivedName,
                         slug: neighborhoodSlug,
                         image_url: props[0]?.images?.[0], // Use first property image as hero
                         content: null, // Will generate below
                         faq: null
                     };
                } else {
                    // No record AND no properties -> 404
                    throw new Error("Neighborhood not found");
                }
            }

            // 5. Generate content if missing
            if (!neighborhoodData.content || !neighborhoodData.faq) {
                const generatedContent = generateNeighborhoodContent(neighborhoodData.name, props);
                const generatedFAQ = generateNeighborhoodFAQ(neighborhoodData.name, props);
                const generatedSchema = generateNeighborhoodSchema(neighborhoodData.name, props);
                
                // Update local state
                neighborhoodData = {
                    ...neighborhoodData,
                    content: generatedContent,
                    faq: generatedFAQ,
                    schema: generatedSchema
                };

                // Ideally, we would save this back to Supabase here if the user has permissions,
                // or via an Edge Function. For client-side strictly, we just use it.
                // We'll skip the write-back for now to avoid permission errors if user is anon.
            }

            setNeighborhood(neighborhoodData);

        } catch (err) {
            console.error("Error loading neighborhood page:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1a3a52] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Carregando informações do bairro...</p>
                </div>
            </div>
        );
    }

    if (error || !neighborhood) {
        return <Navigate to="/404" replace />;
    }

    // SEO Objects
    const seoData = generateNeighborhoodSEO(neighborhood.name, properties);
    const faqSchema = generateNeighborhoodFAQSchema(neighborhood.name, neighborhood.faq);
    
    return (
        <>
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <link rel="canonical" href={seoData.canonical} />
                
                {/* OG Tags */}
                <meta property="og:title" content={seoData.ogTitle} />
                <meta property="og:description" content={seoData.ogDescription} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:type" content={seoData.ogType} />
                <meta property="og:url" content={seoData.ogUrl} />
                
                {/* Twitter Tags */}
                <meta name="twitter:card" content={seoData.twitterCard} />
                <meta name="twitter:title" content={seoData.twitterTitle} />
                <meta name="twitter:description" content={seoData.twitterDescription} />
                <meta name="twitter:image" content={seoData.twitterImage} />

                {/* Schemas */}
                {neighborhood.schema && (
                    <script type="application/ld+json">
                        {JSON.stringify(neighborhood.schema)}
                    </script>
                )}
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
            </Helmet>

            <main className="min-h-screen bg-[#f5f7fa] pb-20">
                <NeighborhoodHero 
                    neighborhood={neighborhood.name} 
                    image={neighborhood.image_url || properties[0]?.images?.[0]} 
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Content & Listings */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Intro Content */}
                            <NeighborhoodContent 
                                content={neighborhood.content} 
                                faq={neighborhood.faq} 
                            />

                            {/* Property Lists */}
                            <PropertyListByNeighborhood 
                                properties={properties} 
                                neighborhoodData={neighborhood}
                            />
                        </div>

                        {/* Right Column: Sticky Sidebar with Form */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <NeighborhoodContactForm neighborhoodData={neighborhood} />
                            </div>
                        </div>
                    </div>
                </div>

                <NeighborhoodWhatsAppCTA neighborhoodData={neighborhood} />
            </main>
        </>
    );
};

export default NeighborhoodPage;