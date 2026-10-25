import { Link, createFileRoute } from '@tanstack/react-router'
import { formatDate, posts } from '../lib/posts'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <section className="intro" aria-labelledby="intro-title">
        <p className="eyebrow">开发 · 阅读 · 生活</p>
        <h1 id="intro-title">
          慢慢探索，
          <br />
          认真记录。
        </h1>
        <p className="intro-description">
          你好，我是 Vincent。这里存放一些代码、想法，
          <br className="desktop-break" />
          以及值得记住的小事。
        </p>
      </section>
      <section aria-labelledby="posts-title" className="posts-section">
        <div className="section-heading">
          <h2 id="posts-title">最新文章</h2>
          <span>{posts.length} 篇记录</span>
        </div>
        <ol className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="post-card">
                <div className="post-meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>{post.category}</span>
                </div>
                <h3>
                  <Link to="/posts/$slug" params={{ slug: post.slug }}>
                    {post.title}
                    <span aria-hidden="true" className="post-arrow">
                      ↗
                    </span>
                  </Link>
                </h3>
                <p>{post.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
