import firstPost from '../content/hello-blog.md?raw'
import writingPost from '../content/writing-as-thinking.md?raw'

export interface Post {
  slug: string
  title: string
  date: string
  category: string
  description: string
  content: string
}

export const posts: Post[] = [
  {
    slug: 'hello-blog',
    title: '你好，博客：从一个小小的开始',
    date: '2026-10-25',
    category: '开发手记',
    description:
      '搭一个简单的个人空间，把折腾技术的过程和那些细小的发现，慢慢写下来。',
    content: firstPost,
  },
  {
    slug: 'writing-as-thinking',
    title: '把写作当成思考的一部分',
    date: '2026-10-24',
    category: '日常思考',
    description:
      '不必等到想清楚才动笔。有时，写下第一句话，就是整理思绪的开始。',
    content: writingPost,
  },
].sort((a, b) => b.date.localeCompare(a.date))

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
