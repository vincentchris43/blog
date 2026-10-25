import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>这篇故事还没写下</h1>
      <p>页面不存在，或文章已经搬家。去首页看看其他文章吧。</p>
      <Link to="/" className="text-link">
        返回文章列表 →
      </Link>
    </section>
  )
}
