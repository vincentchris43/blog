import { Link, useLocation, useRouter } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

export function MarkdownLink({ href, children, ...props }: ComponentProps<'a'>) {
  const location = useLocation()
  const router = useRouter()

  // Schemes, protocol-relative URLs and in-page anchors retain native behavior.
  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  const url = new URL(href, `https://markdown.invalid${location.href}`)
  return (
    <Link
      {...props}
      to={url.pathname}
      search={router.options.parseSearch!(url.search)}
      hash={url.hash.slice(1)}
    >
      {children}
    </Link>
  )
}
