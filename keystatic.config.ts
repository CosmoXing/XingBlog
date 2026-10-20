import { config, fields, collection } from '@keystatic/core';

/**
 * 本地 `npm run dev` 时用 local 模式，直接改 src/content 里的文件；
 * 构建/部署时自动切到 Keystatic Cloud。
 *
 * Cloud 项目名在 Cloudflare Pages 的环境变量里配置：
 *   PUBLIC_KEYSTATIC_PROJECT = 你的 team/项目名
 */
const storage =
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'local'
    ? ({ kind: 'local' } as const)
    : ({ kind: 'cloud' } as const);

const cloudProject =
  (import.meta.env.PUBLIC_KEYSTATIC_PROJECT as string | undefined) ?? 'your-team/cosmoxing';

function blogCollection(label: string, folder: string, category: string) {
  return collection({
    label,
    slugField: 'title',
    path: `src/content/blog/${folder}/*` as `${string}/*`,
    format: { contentField: 'body' },
    schema: {
      title: fields.slug({ name: { label: '标题' } }),
      description: fields.text({
        label: '摘要',
        description: '会出现在卡片、搜索和 RSS 里，建议 30–60 字',
        multiline: true,
        validation: { isRequired: true }
      }),
      pubDate: fields.date({
        label: '发布日期',
        validation: { isRequired: true }
      }),
      category: fields.select({
        label: '分类',
        options: [{ label: category, value: category }],
        defaultValue: category
      }),
      tags: fields.array(fields.text({ label: '标签' }), {
        label: '标签',
        itemLabel: (props) => props.value
      }),
      pinned: fields.checkbox({ label: '置顶', defaultValue: false }),
      draft: fields.checkbox({ label: '草稿', defaultValue: false }),
      body: fields.mdx({
        label: '正文',
        extension: 'md',
        options: {
          table: true,
          codeBlock: true,
          image: {
            directory: 'public/images',
            publicPath: '/images'
          }
        }
      })
    }
  });
}

export default config({
  storage,
  cloud: { project: cloudProject },
  ui: {
    brand: { name: 'CosmoXing 控制台' }
  },
  collections: {
    tech: blogCollection('技术', 'tech', '技术'),
    life: blogCollection('生活', 'life', '生活'),
    reading: blogCollection('读书', 'reading', '读书'),
    notes: blogCollection('随笔', 'notes', '随笔'),
    moments: collection({
      label: '动态',
      slugField: 'slug',
      path: 'src/content/moments/*',
      format: { contentField: 'body' },
      schema: {
        slug: fields.slug({
          name: {
            label: '标识',
            description: '用于文件名，建议写成 2026-10-20-主题'
          }
        }),
        date: fields.date({
          label: '日期',
          validation: { isRequired: true }
        }),
        body: fields.mdx({
          label: '内容',
          extension: 'md'
        })
      }
    })
  }
});
