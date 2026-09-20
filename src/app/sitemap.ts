import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ramcharitmanas.vercel.app';
  const now = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/daily`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
