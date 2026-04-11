import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://kerfos.com'
  const now = new Date()

  const staticRoutes = [
    { url: base,                   priority: 1.0,  changeFrequency: 'weekly'  as const },
    { url: `${base}/pricing`,      priority: 0.9,  changeFrequency: 'monthly' as const },
    { url: `${base}/design/builder`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/optimize`,     priority: 0.8,  changeFrequency: 'monthly' as const },
    { url: `${base}/export`,       priority: 0.8,  changeFrequency: 'monthly' as const },
    { url: `${base}/export/gcode`, priority: 0.7,  changeFrequency: 'monthly' as const },
    { url: `${base}/hardware`,     priority: 0.7,  changeFrequency: 'monthly' as const },
    { url: `${base}/materials`,    priority: 0.7,  changeFrequency: 'monthly' as const },
    { url: `${base}/community`,    priority: 0.6,  changeFrequency: 'weekly'  as const },
    { url: `${base}/community/gallery`, priority: 0.6, changeFrequency: 'daily' as const },
    { url: `${base}/tools`,        priority: 0.5,  changeFrequency: 'monthly' as const },
    { url: `${base}/login`,        priority: 0.3,  changeFrequency: 'yearly'  as const },
    { url: `${base}/register`,     priority: 0.4,  changeFrequency: 'yearly'  as const },
  ]

  return staticRoutes.map(r => ({ ...r, lastModified: now }))
}
