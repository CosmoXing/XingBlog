import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 上线前把这里换成你的正式域名
  site: 'https://blog.cosmoxing.com',
  adapter: cloudflare({ imageService: 'compile' }),
  session: { driver: 'memory' },
  vite: {
    server: {
      watch: {
        ignored: ['**/.workbuddy/**', '**/dist/**']
      }
    }
  },
  integrations: [react(), keystatic(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true
    }
  }
});
