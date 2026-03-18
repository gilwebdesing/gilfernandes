
# Documentação de Arquitetura Técnica

Bem-vindo à documentação de arquitetura técnica do projeto Imóveis SP. Este documento detalha a stack tecnológica, a estrutura do projeto, a configuração do banco de dados e as diretrizes de portabilidade da aplicação.

## Índice
1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Conexão com Banco de Dados](#3-conexão-com-banco-de-dados)
4. [Arquivos Essenciais](#4-arquivos-essenciais)
5. [Dependências da Plataforma Horizons](#5-dependências-da-plataforma-horizons)
6. [Portabilidade](#6-portabilidade)

---

## 1. Stack Tecnológico

A aplicação foi desenvolvida utilizando modernas tecnologias de frontend, focando em performance, manutenibilidade e experiência do usuário.

**Framework Principal:**
- **React** (`^18.3.1`): Biblioteca principal para construção da interface.
- **Vite** (`^4.4.5`): Ferramenta de build e servidor de desenvolvimento ultra-rápido.

**Navegação e Roteamento:**
- **React Router DOM** (`^6.16.0`): Gerenciamento de rotas SPA (Single Page Application).

**Estilização e UI:**
- **Tailwind CSS** (`^3.4.17`): Framework utilitário de CSS.
- **shadcn/ui** (via `@radix-ui/*`): Componentes acessíveis e customizáveis.
- **Framer Motion** (`^11.15.0`): Biblioteca para animações fluidas e complexas.
- **Lucide React** (`^0.469.0`): Ícones consistentes e leves.

**Backend e Dados:**
- **Supabase JS** (`2.30.0`): SDK oficial para integração com o BaaS Supabase (Autenticação, Banco de Dados, Storage).

**Bibliotecas Específicas:**
- **Leaflet & React-Leaflet** (`^1.9.4` / `^4.2.1`): Renderização de mapas interativos para localização de imóveis.
- **React Quill** (`^2.0.0`): Editor de rich text (WYSIWYG) para descrições de imóveis.
- **React Hook Form** (`^7.71.2`): Gerenciamento eficiente de formulários complexos.
- **Recharts** (`^3.8.0`): Visualização de dados e gráficos para painéis administrativos.

---

## 2. Estrutura de Pastas

A arquitetura de pastas segue um padrão modular baseado em domínios de funcionalidade.

