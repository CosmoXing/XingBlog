---
title: 给静态博客加搜索：Pagefind 与 JSON 索引
description: 零后端的两种做法，以及我为什么先选了更笨的那一种。
pubDate: 2026-10-05
category: 技术
tags: [搜索, Astro, 静态站点]
---

静态博客加搜索，常见方案有两类：构建时生成倒排索引（Pagefind），或者干脆导出一份 JSON 在前端过滤。

## Pagefind 的优点

- 构建后自动扫描 HTML，生成分片索引。
- 支持中文分词、权重、摘要高亮。
- 前端按需加载，文章多了也不会拖慢首屏。

```bash
npx pagefind --site dist
```

## JSON 索引的优点

- 零依赖，索引就是一个 `search.json`。
- 可以完全控制字段和排序。
- 几十篇文章的规模，前端过滤延迟几乎感觉不到。

```ts
const index = posts.map((post) => ({
  title: post.data.title,
  description: post.data.description,
  tags: post.data.tags,
  url: `/posts/${post.id}/`
}));
```

## 我的选择

这个站目前用 JSON 索引：文章数量不多，搜索框又是按需打开，没必要为它增加一个构建步骤。等文章过百，再换 Pagefind 也不迟。

技术选型不是选「更先进」，而是选「现在最合适的维护成本」。
