import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';
import { sortPosts } from '../utils';

export async function GET(context) {
  const posts = sortPosts(await getCollection('blog', ({ data }) => !data.draft));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.id}/`,
      categories: [post.data.category, ...post.data.tags]
    })),
    customData: '<language>zh-cn</language>'
  });
}
