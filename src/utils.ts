import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function wordCount(post: Post): number {
  return (post.body ?? '').replace(/\s/g, '').length;
}

export function readingMinutes(post: Post): number {
  return Math.max(1, Math.round(wordCount(post) / 400));
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

export function categoryCounts(posts: Post[]) {
  return ['技术', '生活', '读书', '随笔'].map((name) => ({
    name,
    count: posts.filter((p) => p.data.category === name).length
  }));
}

export function tagCounts(posts: Post[]) {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
}

export function groupByYear(posts: Post[]) {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, posts: items }));
}

export function totalWords(posts: Post[]): number {
  return posts.reduce((sum, post) => sum + wordCount(post), 0);
}

export function daysSince(dateString: string): number {
  const start = new Date(dateString).getTime();
  return Math.max(1, Math.floor((Date.now() - start) / 86400000));
}

export const COVERS: Array<[string, string]> = [
  ['rgba(56,189,248,.22)', 'rgba(129,140,248,.18)'],
  ['rgba(45,212,191,.18)', 'rgba(59,130,246,.16)'],
  ['rgba(129,140,248,.22)', 'rgba(56,189,248,.14)'],
  ['rgba(167,139,250,.20)', 'rgba(56,189,248,.12)'],
  ['rgba(251,191,36,.16)', 'rgba(244,114,182,.12)'],
  ['rgba(251,146,60,.14)', 'rgba(129,140,248,.14)']
];

export function coverStyle(index: number): string {
  const [c1, c2] = COVERS[index % COVERS.length];
  return `--c1:${c1};--c2:${c2}`;
}

export function categoryHref(category: string): string {
  return `/categories/${encodeURIComponent(category)}/`;
}

export function tagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}/`;
}
