import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // disallow: '/private/', // Si tuvieras rutas privadas
    },
    sitemap: 'https://tudominio.com/sitemap.xml',
  }
}