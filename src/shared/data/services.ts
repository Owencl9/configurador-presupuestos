import type { Category, Service } from '../types/service'

/* =============================================================================
 * AVISO: TODOS LOS PRECIOS DE ESTE ARCHIVO SON FICTICIOS
 * =============================================================================
 *
 * Este repositorio es público y forma parte de un Trabajo Final de Máster. Las
 * tarifas reales de la agencia del autor no se publican. Los importes, los
 * mínimos de contratación y el contenido de cada servicio son inventados y
 * están elegidos únicamente para que el catálogo sea verosímil y para poder
 * probar las reglas de negocio del apartado 4.3 de la especificación.
 *
 * No sirven como referencia de precios de mercado ni como oferta comercial.
 * ========================================================================== */

/**
 * Categorías del catálogo, **en el orden en que se muestran**.
 *
 * El orden es un dato, no una casualidad: va de lo que se contrata primero
 * (el sitio web) a lo que lo sostiene después (la infraestructura). Por eso
 * `groupServicesByCategory` respeta este orden y no lo ordena alfabéticamente.
 */
export const CATEGORIES: readonly Category[] = [
  { id: 'web-design', label: 'Diseño web' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'infrastructure', label: 'Infraestructura' },
]

/**
 * Los doce servicios del catálogo. Precios **en céntimos** (ADR 0003).
 *
 * Los niveles —SEO Básico y Profesional, Mantenimiento Básico y Premium— son
 * servicios independientes, con su propio identificador y su propio precio. No
 * hay ningún campo «nivel» ni ninguna relación entre ellos: para el cálculo son
 * servicios cualesquiera, y no añaden ninguna regla de precio nueva. Ver
 * [ADR 0006](../../../docs/adr/0006-niveles-como-servicios-independientes.md).
 *
 * Para añadir, quitar o editar un servicio basta con tocar esta lista. La
 * lógica no conoce ningún servicio concreto, y los tests de
 * `services.test.ts` avisan si la edición deja el catálogo incoherente.
 */
export const SERVICES: readonly Service[] = [
  // --- Diseño web: proyectos que se pagan una vez -------------------------
  {
    id: 'campaign-landing-page',
    name: 'Landing page de campaña',
    description:
      'Página única orientada a conversión, con formulario y analítica.',
    category: 'web-design',
    priceCents: 45_000, // 450,00 €
    payment: 'one-time',
  },
  {
    id: 'corporate-website',
    name: 'Web corporativa',
    description:
      'Sitio de hasta 5 páginas, adaptado a móvil y optimizado para buscadores.',
    category: 'web-design',
    priceCents: 120_000, // 1.200,00 €
    payment: 'one-time',
  },
  {
    id: 'online-store',
    name: 'Tienda online',
    description:
      'Catálogo, carrito y pasarela de pago, con hasta 50 productos cargados.',
    category: 'web-design',
    priceCents: 250_000, // 2.500,00 €
    payment: 'one-time',
  },

  // --- Marketing: cuotas mensuales con permanencia mínima -----------------
  {
    id: 'seo-basic',
    name: 'SEO Básico',
    description:
      'Optimización técnica, estudio de palabras clave e informe mensual.',
    category: 'marketing',
    priceCents: 25_000, // 250,00 €/mes
    payment: 'monthly',
    minMonths: 6,
  },
  {
    id: 'seo-professional',
    name: 'SEO Profesional',
    description:
      'Incluye el plan básico y añade contenidos, enlaces y seguimiento de la competencia.',
    category: 'marketing',
    priceCents: 45_000, // 450,00 €/mes
    payment: 'monthly',
    minMonths: 6,
  },
  {
    id: 'social-media',
    name: 'Gestión de redes sociales',
    description:
      'Calendario de publicaciones, diseño de piezas y respuesta a comentarios en dos redes.',
    category: 'marketing',
    priceCents: 30_000, // 300,00 €/mes
    payment: 'monthly',
    minMonths: 3,
  },

  // --- Mantenimiento: cuotas mensuales ------------------------------------
  {
    id: 'maintenance-basic',
    name: 'Mantenimiento Básico',
    description:
      'Actualizaciones, copias de seguridad semanales y supervisión de caídas.',
    category: 'maintenance',
    priceCents: 6_000, // 60,00 €/mes
    payment: 'monthly',
    minMonths: 3,
  },
  {
    id: 'maintenance-premium',
    name: 'Mantenimiento Premium',
    description:
      'Incluye el básico y añade copias diarias, entorno de pruebas y soporte en 24 horas.',
    category: 'maintenance',
    priceCents: 15_000, // 150,00 €/mes
    payment: 'monthly',
    minMonths: 3,
  },
  {
    id: 'content-updates',
    name: 'Actualización de contenidos',
    description:
      'Hasta cuatro cambios de textos o imágenes al mes, a petición.',
    category: 'maintenance',
    priceCents: 11_000, // 110,00 €/mes
    payment: 'monthly',
    minMonths: 3,
  },

  // --- Infraestructura: cuotas anuales y una puesta en marcha -------------
  {
    id: 'hosting-domain',
    name: 'Hosting y dominio',
    description:
      'Alojamiento SSD, dominio .com o .es y certificado SSL renovado automáticamente.',
    category: 'infrastructure',
    priceCents: 12_000, // 120,00 €/año
    payment: 'yearly',
  },
  {
    id: 'business-email',
    name: 'Correo corporativo',
    description:
      'Cinco buzones profesionales con el dominio propio y filtro antispam.',
    category: 'infrastructure',
    priceCents: 7_200, // 72,00 €/año
    payment: 'yearly',
  },
  {
    id: 'server-migration',
    name: 'Migración a servidor',
    description:
      'Traslado de una web existente, con pruebas y sin interrupción del servicio.',
    category: 'infrastructure',
    priceCents: 30_000, // 300,00 €
    payment: 'one-time',
  },
]
