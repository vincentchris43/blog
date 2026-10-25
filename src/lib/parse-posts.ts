import { parseDocument } from 'yaml'

export interface Post {
  slug: string
  title: string
  date: string
  category: string
  description: string
  content: string
}

export function parsePosts(files: Record<string, string>): Post[] {
  const slugs = new Set<string>()
  const posts = Object.entries(files).map(([path, source]) => {
    const fail = (message: string): never => {
      throw new Error(`${path}: ${message}`)
    }
    const slug = path.split('/').at(-1)?.replace(/\.md$/, '') ?? ''
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      fail('filename must be a lowercase kebab-case slug')
    }
    if (slugs.has(slug)) fail(`duplicate slug "${slug}"`)
    slugs.add(slug)

    const frontmatter = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
    if (!frontmatter) return fail('expected YAML frontmatter between --- lines')
    const document = parseDocument(frontmatter[1])
    if (document.errors.length) fail(`invalid YAML: ${document.errors[0].message}`)
    const data: unknown = document.toJSON()
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return fail('frontmatter must be a mapping')
    }
    const content = source.slice(frontmatter[0].length)
    const field = (name: string): string => {
      const value: unknown = (data as Record<string, unknown>)[name]
      return typeof value === 'string' && value.trim()
        ? value.trim()
        : fail(`"${name}" must be a non-empty string`)
    }
    const date = field('date')
    const timestamp = Date.parse(`${date}T00:00:00Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString().slice(0, 10) !== date
    ) {
      fail('"date" must be a valid YYYY-MM-DD calendar date')
    }
    if (!content.trim()) fail('Markdown body must not be empty')

    return {
      slug,
      title: field('title'),
      date,
      category: field('category'),
      description: field('description'),
      content,
    }
  })

  return posts.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  )
}
