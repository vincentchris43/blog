import { parsePosts } from './parse-posts'

export const posts = parsePosts(
  import.meta.glob<string>('../content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
)

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
