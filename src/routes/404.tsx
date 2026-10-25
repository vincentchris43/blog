import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '../components/not-found'

// Render successfully at build time; the file server supplies HTTP 404 for errors.
export const Route = createFileRoute('/404')({
  head: () => ({
    meta: [
      { title: '页面未找到 | Vincent 的博客' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: NotFound,
})
