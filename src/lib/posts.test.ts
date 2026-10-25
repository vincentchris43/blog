import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parsePosts } from './parse-posts'
import { formatDate, posts } from './posts'

const article = (metadata = '', body = '## 正文\n\n一篇测试文章。') => `---
title: 测试文章
date: '2024-02-29'
category: 开发
description: 测试摘要
${metadata}---
${body}`

describe('posts registry', () => {
  it('discovers every Markdown file and keeps frontmatter out of the body', () => {
    const files = readdirSync(new URL('../content/', import.meta.url), { recursive: true })
      .map(String)
      .filter((file) => file.endsWith('.md'))
    expect(posts.map((post) => post.slug).sort()).toEqual(
      files.map((file) => file.split('/').at(-1)!.replace(/\.md$/, '')).sort(),
    )
    expect(posts.length).toBeGreaterThanOrEqual(2)
    for (const post of posts) {
      expect(post.title).toBeTruthy()
      expect(post.content.trim()).toMatch(/^## /)
      expect(post.content).not.toContain('description:')
    }
  })

  it('derives slugs from filenames and sorts newest first with stable ties', () => {
    const result = parsePosts({
      'zebra.md': article(),
      'old.md': article().replace('2024-02-29', '2023-01-01'),
      'nested/alpha.md': article(),
      'new.md': article().replace('2024-02-29', '2026-10-25'),
    })
    expect(result.map(({ slug }) => slug)).toEqual(['new', 'alpha', 'zebra', 'old'])
    expect(result[0]).toMatchObject({ title: '测试文章', category: '开发', description: '测试摘要' })
  })

  it.each(['title', 'date', 'category', 'description'])('rejects missing %s with the filename', (field) => {
    const source = article().replace(new RegExp(`^${field}:.*\\n`, 'm'), '')
    expect(() => parsePosts({ 'broken.md': source })).toThrow(`broken.md: "${field}"`)
  })

  it.each(["title: ''", 'category: 42', 'description: [a, b]', 'date: null'])(
    'rejects invalid metadata: %s', (replacement) => {
      const key = replacement.split(':')[0]
      const source = article().replace(new RegExp(`^${key}:.*$`, 'm'), replacement)
      expect(() => parsePosts({ 'broken.md': source })).toThrow('must be a non-empty string')
    },
  )

  it.each(['2023-02-29', '2024-02-30', '2024-13-01', '2024-2-01', 'invalid'])(
    'rejects invalid calendar date %s', (date) => {
      expect(() => parsePosts({ 'bad-date.md': article().replace('2024-02-29', date) }))
        .toThrow('bad-date.md: "date" must be a valid YYYY-MM-DD calendar date')
    },
  )

  it('rejects duplicate slugs across directories', () => {
    expect(() => parsePosts({ 'one/same.md': article(), 'two/same.md': article() }))
      .toThrow('two/same.md: duplicate slug "same"')
  })

  it('rejects filenames that cannot be used as slugs', () => {
    expect(() => parsePosts({ 'Bad Slug.md': article() })).toThrow('filename must be')
  })

  it('rejects empty Markdown', () => {
    expect(() => parsePosts({ 'empty.md': article('', '  ') })).toThrow('Markdown body must not be empty')
  })

  it.each(['## No frontmatter', '---\ntitle: [broken\n---\nBody', '---\n- item\n---\nBody'])(
    'reports the filename for missing or malformed frontmatter', (source) => {
      expect(() => parsePosts({ 'broken.md': source })).toThrow('broken.md:')
    },
  )

  it('formats calendar dates in UTC', () => {
    expect(formatDate('2024-02-29')).toBe('2024年2月29日')
  })
})
