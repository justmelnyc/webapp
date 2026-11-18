import 'server-only'
import type { PostBlockInput } from '@/lib/schemas/post'
import { editorHtmlToPostHtml } from '@/utils/editor-post-html'

export type ApiBlock = (
  | { kind: 'text'; data: string }
  | { kind: 'image'; data: { url: string; alt?: string } }
  | { kind: 'embed'; data: { service: string; url: string; thumbnailLargeUrl: string; id: string } }
) & { link_url?: string }

/** Composer blocks -> the `body` the posts API takes. Text is sanitized here, once, at the boundary. */
export const buildPostBody = (blocks: PostBlockInput[], buyLink: string | null): ApiBlock[] => {
  const body: ApiBlock[] = []
  for (const block of blocks) {
    if (block.kind === 'image') {
      body.push({ kind: 'image', data: block.alt ? { url: block.url, alt: block.alt } : { url: block.url } })
    } else if (block.kind === 'embed') {
      const { service, url, thumbnailLargeUrl, embedId } = block
      body.push({ kind: 'embed', data: { service, url, thumbnailLargeUrl, id: embedId } })
    } else {
      const html = editorHtmlToPostHtml(block.text)
      if (html) body.push({ kind: 'text', data: html })
    }
  }
  if (buyLink) body.forEach((block) => (block.link_url = buyLink))
  return body
}
