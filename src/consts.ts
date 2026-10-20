export const SITE = {
  title: 'CosmoXing',
  subtitle: '把想法写进星图里',
  description: '一个关于技术、生活与阅读的个人观测站。记录正在发生的思考，也收藏已经读过的书。',
  tagline: '不因虚度年华而悔恨，不因碌碌无为而羞愧。',
  author: 'CosmoXing',
  // 上线前同步修改 astro.config.mjs 里的 site
  url: 'https://blog.cosmoxing.com',
  startDate: '2026-10-20', // 运行天数计数起点：2026-10-20 起算，当天为第 1 天
  email: 'hello@cosmoxing.com',
  github: 'https://github.com/CosmoXing',
  rss: '/rss.xml'
};

export const NAV = [
  { label: '首页', href: '/', key: 'home' },
  { label: '归档', href: '/archive/', key: 'archive' },
  { label: '动态', href: '/moments/', key: 'moments' },
  { label: '关于', href: '/about/', key: 'about' }
];

export const CATEGORIES = ['技术', '生活', '读书', '随笔'] as const;

export const NOW = [
  { key: '在做', value: '重写博客首页' },
  { key: '在读', value: '《暗淡蓝点》 62%' },
  { key: '在听', value: '坂本龍一 · MCML' }
];

export const SITE_INFO = [
  { key: '框架', value: 'Astro 5' },
  { key: '样式', value: '原生 CSS' },
  { key: '部署', value: 'Cloudflare Pages' },
  { key: '始于', value: '2026.02' }
];

// 填入 Giscus 的仓库信息后评论区会自动启用
export const GISCUS = {
  repo: '',
  repoId: '',
  category: 'Announcements',
  categoryId: ''
};

// 把音频文件放到 public/music/ 下，再把 src 填成 /music/xxx.mp3
export const MUSIC = {
  tracks: [
    { title: 'The truth that you leave', artist: 'Pianoboy 高至豪', src: '/music/the-truth-that-you-leave.mp3', duration: '03:43' },
    { title: '城南花已开', artist: '三亩地', src: '/music/chengnan-huayi-kai.mp3', duration: '04:31' },
    { title: '夜、萤火虫和你', artist: 'AniFace', src: '/music/ye-yinghuochong-he-ni.mp3', duration: '03:09' },
    { title: '所念皆星河', artist: 'CMJ', src: '/music/suo-nian-jie-xing-he.mp3', duration: '03:41' },
    { title: '浮光 (The History)', artist: 'Jannik', src: '/music/fu-guang-the-history.mp3', duration: '04:18' },
    { title: '诀别书', artist: '邓垚', src: '/music/jue-bie-shu.mp3', duration: '04:07' }
  ]
};

export const BOOKS = [
  {
    title: '暗淡蓝点',
    author: 'Carl Sagan · 1994',
    note: '我们的一切，都在这颗小小的蓝点上。',
    stars: 5,
    href: '/posts/reading/pale-blue-dot/'
  },
  {
    title: '设计中的设计',
    author: '原研哉 · 2003',
    note: '把熟悉的东西，重新看一遍。',
    stars: 4,
    href: '/posts/reading/design-of-design/'
  },
  {
    title: '献给阿尔吉侬的花束',
    author: 'Daniel Keyes · 1966',
    note: '智慧与孤独，原来是一起到来的。',
    stars: 5,
    href: '/categories/读书/'
  }
];

export const FRIENDS = [
  { name: '林深', desc: '写代码，也写山野。', url: 'https://example.com', initial: '林' },
  { name: '阿澈', desc: '前端、摄影与咖啡。', url: 'https://example.com', initial: '澈' },
  { name: 'Momo', desc: '一个长期主义的读书人。', url: 'https://example.com', initial: 'M' }
];
