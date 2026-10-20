import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sortPosts, toISO } from '../utils';

export const GET: APIRoute = async () => {
  const posts = sortPosts(await getCollection('blog', ({ data }) => !data.draft));

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    url: `/posts/${post.id}/`,
    date: toISO(post.data.pubDate)
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
