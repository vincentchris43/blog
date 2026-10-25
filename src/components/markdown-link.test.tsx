import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { MarkdownLink } from './markdown-link'

it.each([
  ['/posts/writing-as-thinking', '/posts/writing-as-thinking'],
  ['writing-as-thinking', '/posts/writing-as-thinking'],
  ['../', '/'],
  ['/posts/writing-as-thinking?from=blog#section', '/posts/writing-as-thinking?from=blog#section'],
  ['?from=blog', '/posts/hello-blog?from=blog'],
  ['#section', '#section'],
  ['https://example.com/post', 'https://example.com/post'],
  ['//example.com/post', '//example.com/post'],
  ['mailto:hello@example.com', 'mailto:hello@example.com'],
])('renders Markdown link %s as %s', async (href, expected) => {
  const root = createRootRoute()
  const post = createRoute({
    getParentRoute: () => root,
    path: '/posts/$slug',
    component: () => createElement(MarkdownLink, { href, title: '链接说明' }, '链接'),
  })
  const router = createRouter({
    routeTree: root.addChildren([post]),
    history: createMemoryHistory({ initialEntries: ['/posts/hello-blog'] }),
  })
  await router.load()
  const html = renderToStaticMarkup(createElement(RouterProvider, { router }))
  expect(html).toContain(`href="${expected}"`)
  expect(html).toContain('title="链接说明"')
})
