import type { APIRoute } from 'astro';
import { siteConfig } from '../site.config';

// Preview builds must never be indexed. Production welcomes search and AI crawlers.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export const GET: APIRoute = () => {
  const body =
    siteConfig.deployEnv === 'production'
      ? [
          'User-agent: *',
          'Allow: /',
          '',
          ...AI_BOTS.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
          `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
          '',
        ].join('\n')
      : ['User-agent: *', 'Disallow: /', ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
