import { CANONICAL_BASE_URL } from '@workspace/shared-data/brand';
import { Request, Response } from 'express';
import { ALL_BIBLE_BOOKS } from '@workspace/shared-data/bible-books';

export function generateBibleSitemap(req: Request, res: Response) {
  // Use production URL for deployed site
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? CANONICAL_BASE_URL 
    : req.protocol + '://' + req.get('host');
  
  // Share canonical slugs and chapter counts with the reader.
  // Omit lastmod until reliable content modification dates are available.
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Bible Main Page -->
  <url>
    <loc>${baseUrl}/bible</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;

  // Generate URLs for each book and its chapters
  ALL_BIBLE_BOOKS.forEach(book => {
    // Book overview page
    sitemap += `  <url>
    <loc>${baseUrl}/bible/${book.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    
    // Individual chapter pages
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      sitemap += `  <url>
    <loc>${baseUrl}/bible/${book.slug}/${chapter}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
  });

  sitemap += `</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
}
