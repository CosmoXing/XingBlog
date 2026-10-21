import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: z.string().nullable().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['技术', '生活', '读书', '随笔']),
    tags: z.array(z.string()).default([]),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

const moments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/moments' }),
  schema: z.object({
    date: z.coerce.date()
  })
});

export const collections = { blog, moments };
