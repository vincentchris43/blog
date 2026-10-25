import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown from 'react-markdown'
import httpServer from 'http-server'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { posts } from '../src/lib/posts'

const root = resolve('dist/client')
const server = httpServer.createServer({ root, cache: -1, showDir: false })
let origin

beforeAll(async () => {
  await new Promise((resolve, reject) => {
    server.server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  origin = `http://127.0.0.1:${server.server.address().port}`
})

afterAll(() => new Promise((resolve) => server.server.close(resolve)))

// Compare visible HTML, not serialized hydration data containing the same text.
const visibleText = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

test('home page contains every post and its static assets are served', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8')
  const response = await fetch(origin)
  expect(response.status).toBe(200)
  expect(await response.text()).toBe(html)
  for (const post of posts) {
    expect(html).toContain(`href="/posts/${post.slug}"`)
    expect(html).toContain(post.title)
  }

  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)/g)]
    .map((match) => match[1])
  expect(assets.some((asset) => asset.endsWith('.js'))).toBe(true)
  expect(assets.some((asset) => asset.endsWith('.css'))).toBe(true)
  for (const asset of new Set(assets)) {
    const response = await fetch(`${origin}${asset}`)
    expect(response.status, asset).toBe(200)
    expect(response.headers.get('content-type'), asset).not.toContain('text/html')
    expect(await response.text()).not.toBe('')
  }
})

test.each(posts)('$slug has a complete HTML article on direct requests', async (post) => {
  const html = await readFile(resolve(root, 'posts', post.slug, 'index.html'), 'utf8')
  expect(html).toContain(renderToStaticMarkup(createElement('h1', null, post.title)))
  const body = html.split('<div class="prose">')[1]?.split('</div>')[0]
  expect(body).toBeDefined()
  const markdown = renderToStaticMarkup(createElement(Markdown, { children: post.content }))
  expect(visibleText(body)).toBe(visibleText(markdown))
  for (const suffix of ['', '/', '?from=static-check']) {
    const response = await fetch(`${origin}/posts/${post.slug}${suffix}`)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe(html)
  }
})

test('unknown URLs return a Chinese 404, without an SPA fallback', async () => {
  const html = await readFile(resolve(root, '404.html'), 'utf8')
  expect(html).toContain('<h1>这篇故事还没写下</h1>')
  expect(html).toContain('name="robots" content="noindex"')
  for (const path of ['/posts/not-found', '/missing-page', '/assets/missing.js']) {
    const response = await fetch(`${origin}${path}`)
    expect(response.status, path).toBe(404)
    expect(await response.text()).toBe(html)
  }
})
