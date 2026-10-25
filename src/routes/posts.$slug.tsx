import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import Markdown from 'react-markdown'
import { MarkdownLink } from '../components/markdown-link'
import { formatDate, posts } from '../lib/posts'

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params }) => {
    const post = posts.find((entry) => entry.slug === params.slug)
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} | Vincent 的博客`
          : '文章未找到 | Vincent 的博客',
      },
      ...(loaderData
        ? [{ name: 'description', content: loaderData.description }]
        : []),
    ],
  }),
  component: Post,
})

function Post() {
  const post = Route.useLoaderData()
  return (
    <article className="post-detail">
      <Link to="/" className="back-link">
        ← 全部文章
      </Link>
      <header className="post-heading">
        <div className="post-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.category}</span>
        </div>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
      </header>
      <div className="prose">
        <Markdown
          components={{
            a: ({ node: _node, ...props }) => <MarkdownLink {...props} />,
          }}
        >
          {post.content}
        </Markdown>
      </div>
      <div className="post-end">
        <Link to="/" className="text-link">
          ← 回到文章列表
        </Link>
      </div>
    </article>
  )
}
