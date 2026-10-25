import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Vincent 的博客' },
      { name: 'description', content: '记录开发、阅读和日常思考的个人博客。' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          跳到正文
        </a>
        <div className="site-shell">
          <header className="site-header">
            <Link to="/" className="brand" aria-label="Vincent 的博客首页">
              Vincent<span> / 博客</span>
            </Link>
            <nav aria-label="主导航">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ 'aria-current': 'page' }}
              >
                文章
              </Link>
            </nav>
          </header>
          <main id="main-content">{children}</main>
          <footer className="site-footer">
            <span>Vincent 的博客</span>
            <span>记录，让思考留下痕迹。</span>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
