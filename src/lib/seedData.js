import { supabase } from './supabase';

const sampleProperties = [
  {
    title: 'Apartamento Moderno em Pinheiros',
    description: 'Lindo apartamento com 3 quartos, sendo 2 suítes, em um dos bairros mais desejados de São Paulo. Localizado próximo ao metrô e com fácil acesso a restaurantes, cafés e comércio. O imóvel conta com acabamento de primeira qualidade, sacada gourmet e 2 vagas de garagem.',
    type: 'apartment',
    price: 1200000,
    rental_price: 5500,
    location: 'São Paulo',
    neighborhood: 'Pinheiros',
    bedrooms: 3,
    suites: 2,
    parking_spaces: 2,
    area: 110,
    images: ['https://images.unsplash.com/photo-1692830085898-802ee151c0b6', 'https://images.unsplash.com/photo-1697736715419-49e8e174e41f'],
    featured: true,
    status: 'active'
  },
  {
    title: 'Casa Espaçosa em Vila Mariana',
    description: 'Casa térrea com amplo jardim, 4 quartos sendo 3 suítes. Perfeita para famílias que buscam conforto e tranquilidade. Próxima a escolas, parques e hospitais. Acabamento impecável, cozinha planejada e área de lazer completa.',
    type: 'house',
    price: 2500000,
    rental_price: null,
    location: 'São Paulo',
    neighborhood: 'Vila Mariana',
    bedrooms: 4,
    suites: 3,
    parking_spaces: 3,
    area: 250,
    images: ['https://images.unsplash.com/photo-1693219514035-ccab087ce6ba', 'https://images.unsplash.com/photo-1680034733365-ad7263988417'],
    featured: true,
    status: 'active'
  },
  {
    title: 'Studio Compacto na Consolação',
    description: 'Studio moderno e funcional, ideal para jovens profissionais ou investidores. Localização privilegiada próximo à Av. Paulista, com fácil acesso ao transporte público. Totalmente mobiliado e equipado.',
    type: 'apartment',
    price: 450000,
    rental_price: 2200,
    location: 'São Paulo',
    neighborhood: 'Consolação',
    bedrooms: 1,
    suites: 0,
    parking_spaces: 1,
    area: 35,
    images: ['https://images.unsplash.com/photo-1701202779560-80aa8df53ae1'],
    featured: false,
    status: 'active'
  },
  {
    title: 'Apartamento de Luxo nos Jardins',
    description: 'Apartamento high-end com 4 suítes, sala ampla com 3 ambientes, varanda gourmet e vista panorâmica. Condomínio com infraestrutura completa incluindo piscina, academia, salão de festas e quadra. 4 vagas de garagem.',
    type: 'apartment',
    price: 3500000,
    rental_price: 15000,
    location: 'São Paulo',
    neighborhood: 'Jardins',
    bedrooms: 4,
    suites: 4,
    parking_spaces: 4,
    area: 280,
    images: ['https://images.unsplash.com/photo-1698302662805-9d721be98ddd', 'https://images.unsplash.com/photo-1446938362590-327f73003900'],
    featured: true,
    status: 'active'
  },
  {
    title: 'Sala Comercial em Itaim Bibi',
    description: 'Sala comercial em edifício corporativo moderno, ideal para escritório ou consultório. Excelente localização próximo à Faria Lima, com acesso facilitado e infraestrutura completa. 2 vagas de garagem.',
    type: 'commercial',
    price: 800000,
    rental_price: 4500,
    location: 'São Paulo',
    neighborhood: 'Itaim Bibi',
    bedrooms: null,
    suites: null,
    parking_spaces: 2,
    area: 85,
    images: ['https://images.unsplash.com/photo-1551649081-39f820bb2d3e'],
    featured: false,
    status: 'active'
  },
  {
    title: 'Cobertura Duplex em Higienópolis',
    description: 'Cobertura duplex com 5 suítes, terraço gourmet com piscina privativa, sauna e churrasqueira. Vista deslumbrante da cidade. Acabamento de altíssimo padrão, projeto de iluminação e automação residencial. 5 vagas.',
    type: 'apartment',
    price: 5500000,
    rental_price: null,
    location: 'São Paulo',
    neighborhood: 'Higienópolis',
    bedrooms: 5,
    suites: 5,
    parking_spaces: 5,
    area: 450,
    images: ['https://images.unsplash.com/photo-1692830085898-802ee151c0b6'],
    featured: true,
    status: 'active'
  },
  {
    title: 'Apartamento Prático na Mooca',
    description: 'Apartamento de 2 quartos em bairro tradicional de São Paulo. Ótima localização com fácil acesso ao transporte público, comércio e serviços. Ideal para famílias pequenas ou casal.',
    type: 'apartment',
    price: 650000,
    rental_price: 3200,
    location: 'São Paulo',
    neighborhood: 'Mooca',
    bedrooms: 2,
    suites: 1,
    parking_spaces: 1,
    area: 68,
    images: ['https://images.unsplash.com/photo-1697736715419-49e8e174e41f'],
    featured: false,
    status: 'active'
  },
  {
    title: 'Terreno Comercial em Pinheiros',
    description: 'Terreno comercial em localização nobre, ideal para construção de edifício comercial ou residencial. Zoneamento favorável, próximo a principais vias de acesso. Excelente oportunidade para investidores.',
    type: 'land',
    price: 4200000,
    rental_price: null,
    location: 'São Paulo',
    neighborhood: 'Pinheiros',
    bedrooms: null,
    suites: null,
    parking_spaces: null,
    area: 500,
    images: ['https://images.unsplash.com/photo-1680034733365-ad7263988417'],
    featured: false,
    status: 'active'
  }
];

export const seedProperties = async (brokerId) => {
  try {
    const propertiesWithBroker = sampleProperties.map(property => ({
      ...property,
      broker_id: brokerId
    }));

    const { data, error } = await supabase
      .from('properties')
      .insert(propertiesWithBroker)
      .select();

    if (error) throw error;

    console.log('Properties seeded successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error seeding properties:', error);
    return { success: false, error };
  }
};