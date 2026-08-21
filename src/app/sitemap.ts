import type { MetadataRoute } from "next"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://novapay.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/compliance`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}