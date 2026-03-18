import { calculatePriceRanges, getPropertyCounts } from '@/lib/neighborhoodData';
import { formatPrice } from '@/utils/seoHelpers';

export const generateNeighborhoodContent = (neighborhood, properties) => {
  const priceData = calculatePriceRanges(properties);
  const counts = getPropertyCounts(properties);
  const totalProps = properties.length;
  const saleProps = priceData.saleCount;
  const rentProps = priceData.rentCount;

  // Formatting helpers
  const fmt = (val) => formatPrice(val);
  const fmtRent = (val) => formatPrice(val, true);

  return `
    <article class="neighborhood-content space-y-8">
      <section>
        <h2 class="text-2xl font-bold text-[#1a3a52] mb-4">Introdução: Morar em ${neighborhood}</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">
          ${neighborhood} é um dos bairros mais procurados de São Paulo, oferecendo uma combinação única de qualidade de vida, infraestrutura completa e localização estratégica. 
          Se você está buscando comprar ou alugar um imóvel, esta região se destaca por sua versatilidade, atendendo tanto a famílias que buscam tranquilidade quanto a jovens profissionais que querem estar perto de tudo.
        </p>
        <p class="text-gray-700 leading-relaxed">
          Atualmente, contamos com <strong>${totalProps} imóveis disponíveis</strong> em nosso portfólio nesta região, provando que o mercado imobiliário local está aquecido e cheio de oportunidades.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold text-[#1a3a52] mb-4">Infraestrutura e Lazer</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">
          Viver em ${neighborhood} significa ter acesso fácil a uma vasta gama de serviços. O bairro é conhecido por suas opções gastronômicas, escolas de alto padrão e áreas verdes que proporcionam um refúgio em meio à agitação da cidade.
        </p>
        <p class="text-gray-700 leading-relaxed">
          A mobilidade urbana é outro ponto forte. Com acesso facilitado a importantes vias e opções de transporte público, os moradores desfrutam de praticidade no dia a dia. É o endereço ideal para quem valoriza conveniência sem abrir mão do conforto.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold text-[#1a3a52] mb-4">Perfil Imobiliário de ${neighborhood}</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">
          O mercado imobiliário em ${neighborhood} é diversificado. Encontramos desde studios modernos para quem busca praticidade, até apartamentos amplos de 3 ou mais dormitórios para famílias maiores.
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
          <li><strong>Studios e 1 Dormitório:</strong> Opções ideais para investimento ou moradia solo, representando uma parcela significativa da oferta atual.</li>
          <li><strong>2 Dormitórios:</strong> O equilíbrio perfeito entre espaço e custo-benefício.</li>
          <li><strong>3+ Dormitórios:</strong> Imóveis de alto padrão para quem não abre mão de espaço e conforto.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-bold text-[#1a3a52] mb-4">Mercado e Preços: Venda e Locação</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">
          Para quem deseja comprar, os valores em ${neighborhood} variam conforme o padrão e a localização exata. 
          ${saleProps > 0 ? `Atualmente, temos <strong>${saleProps} opções de venda</strong>, com preços começando em <strong>${fmt(priceData.saleMin)}</strong> e chegando a <strong>${fmt(priceData.saleMax)}</strong> para os imóveis mais exclusivos.` : `A demanda por compra é alta na região.`}
        </p>
        <p class="text-gray-700 leading-relaxed">
          ${rentProps > 0 ? `Já para locação, contamos com <strong>${rentProps} imóveis</strong>. Os aluguéis iniciam em <strong>${fmtRent(priceData.rentMin)}</strong>, oferecendo flexibilidade para diferentes orçamentos.` : `O mercado de locação também é bastante ativo.`}
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold text-[#1a3a52] mb-4">Por que Investir em ${neighborhood}?</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">
          A valorização constante faz de ${neighborhood} uma escolha segura para investidores. A demanda por locação na área garante boa liquidez, enquanto a infraestrutura consolidada assegura a manutenção do valor patrimonial a longo prazo.
        </p>
        <p class="text-gray-700 leading-relaxed">
          Não perca a chance de conhecer as oportunidades exclusivas que separamos para você. Navegue abaixo pelos imóveis disponíveis e agende sua visita com nosso especialista local.
        </p>
      </section>
    </article>
  `;
};

export const generateNeighborhoodFAQ = (neighborhood, properties) => {
  const priceData = calculatePriceRanges(properties);
  const fmt = (val) => formatPrice(val);

  return [
    {
      question: `Vale a pena morar em ${neighborhood}?`,
      answer: `Sim, ${neighborhood} é considerado um dos melhores bairros de São Paulo, oferecendo excelente infraestrutura, segurança e qualidade de vida, com fácil acesso a serviços e transporte.`
    },
    {
      question: `Quanto custa comprar um apartamento em ${neighborhood}?`,
      answer: priceData.saleCount > 0 
        ? `Os preços variam bastante. Atualmente em nosso portfólio, os valores partem de ${fmt(priceData.saleMin)} e podem chegar a ${fmt(priceData.saleMax)} dependendo do tamanho e padrão do imóvel.`
        : `Os preços variam conforme o mercado. Entre em contato para consultar valores atualizados.`
    },
    {
      question: `É um bom investimento comprar imóveis em ${neighborhood}?`,
      answer: `Com certeza. A região apresenta valorização constante e alta demanda por locação, tornando-se um porto seguro para investidores que buscam rentabilidade e segurança patrimonial.`
    },
    {
      question: `Quais tipos de imóveis encontro em ${neighborhood}?`,
      answer: `A região é democrática, oferecendo desde studios compactos e modernos até apartamentos familiares amplos e coberturas de alto padrão.`
    },
    {
      question: `Como é o transporte e mobilidade em ${neighborhood}?`,
      answer: `${neighborhood} é bem servido por transporte público e vias de acesso, facilitando o deslocamento para outras regiões importantes da capital paulista.`
    }
  ];
};

export const generateNeighborhoodSchema = (neighborhood, properties) => {
  const priceData = calculatePriceRanges(properties);
  const title = `Imóveis à Venda e Locação em ${neighborhood}, SP`;
  const description = `Confira as melhores oportunidades de imóveis em ${neighborhood}. Apartamentos, casas e studios para morar ou investir com a curadoria de Gil Corretor.`;
  
  // Use first property image or a default fallback
  const image = properties?.[0]?.images?.[0] || 'https://gilcorretorsp.com.br/og-image-default.jpg';
  const canonical = `https://gilcorretorsp.com.br/neighborhood/${neighborhood.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": [image],
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Gil Corretor",
      "url": "https://gilcorretorsp.com.br"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gil Corretor SP",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gilcorretorsp.com.br/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonical
    }
  };
};

export const generateNeighborhoodFAQSchema = (neighborhood, faqData) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
};

export const generateNeighborhoodSEO = (neighborhood, properties) => {
  const priceData = calculatePriceRanges(properties);
  const hasSales = priceData.saleCount > 0;
  const hasRent = priceData.rentCount > 0;

  let title = `Imóveis em ${neighborhood} - São Paulo | Gil Corretor`;
  if (hasSales && hasRent) title = `Imóveis à Venda e Locação em ${neighborhood} - SP | Gil Corretor`;
  else if (hasSales) title = `Apartamentos à Venda em ${neighborhood} - SP | Gil Corretor`;
  else if (hasRent) title = `Apartamentos para Alugar em ${neighborhood} - SP | Gil Corretor`;

  const description = `Procurando imóveis em ${neighborhood}? Encontre as melhores opções de ${hasSales ? 'venda' : ''} ${hasSales && hasRent ? 'e' : ''} ${hasRent ? 'locação' : ''}. Confira preços, fotos e agende sua visita com especialista local.`;

  const image = properties?.[0]?.images?.[0] || 'https://gilcorretorsp.com.br/og-default.jpg';
  const slug = neighborhood.toLowerCase().replace(/\s+/g, '-');
  const url = `https://gilcorretorsp.com.br/neighborhood/${slug}`;

  return {
    title,
    description,
    canonical: url,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogType: 'article',
    ogUrl: url,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    twitterCard: 'summary_large_image'
  };
};