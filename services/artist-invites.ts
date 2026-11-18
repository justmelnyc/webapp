import 'server-only'
import { z } from 'zod'
import { graphql, rest, restWithHeaders } from '@/lib/api/client'
import { FIND_POSTS } from '@/constants/artist-invite-queries'
import { sanitizePost } from '@/services/sanitize'
import {
  artistInviteSchema,
  submissionPageRecordSchema,
  submissionRecordSchema,
  type ArtistInvite,
  type Submission,
  type SubmissionPage,
} from '@/types/artist-invite'
import { postSchema } from '@/types/post'
import { streamPath } from '@/utils/artist-invite'

const listEnvelope = z.object({ artistInvites: z.array(artistInviteSchema) })
const detailEnvelope = z.object({ artistInvites: artistInviteSchema })
const postsEnvelope = z.object({ findPosts: z.array(postSchema) })

/** The invites index (the original asks for 20 per page and shows the first). */
export const getArtistInvites = async (): Promise<ArtistInvite[]> => {
  const data = await rest('/api/v2/artist_invites?per_page=20', listEnvelope)
  return data.artistInvites
}

/** Throws NotFoundError for an unknown slug. */
export const getArtistInvite = async (slug: string): Promise<ArtistInvite> => {
  const data = await rest(`/api/v2/artist_invites/~${encodeURIComponent(slug)}`, detailEnvelope)
  return data.artistInvites
}

const PER_PAGE = 25

/** One page of a submission stream, with each submission's post attached (the API only names the posts). */
export const getSubmissionPage = async (href: string, page: number): Promise<SubmissionPage> => {
  const joiner = href.includes('?') ? '&' : '?'
  const path = `${streamPath(href)}${joiner}per_page=${PER_PAGE}&page=${page}`
  const { data, headers } = await restWithHeaders(path, submissionPageRecordSchema)
  const tokens = new Map(data.linked.posts.map((post) => [post.id, post.token]))
  const records = data.artistInviteSubmissions.filter((record) => tokens.has(record.links.post.id))
  const found = records.length
    ? (await graphql(FIND_POSTS, { tokens: [...new Set(records.map((r) => tokens.get(r.links.post.id) ?? ''))] }, postsEnvelope)).findPosts
    : []
  const posts = new Map(found.map((post) => [post.id, sanitizePost(post)]))
  const submissions = records.flatMap((record): Submission[] => {
    const post = posts.get(record.links.post.id)
    return post ? [{ id: record.id, status: record.status, actions: record.actions, post }] : []
  })
  const totalPages = Number(headers.get('X-Total-Pages')) || 1
  return { submissions, nextPage: page < totalPages ? page + 1 : null, totalCount: Number(headers.get('X-TotalCount')) || submissions.length }
}

/** Curator action (approve, decline, select, ...): the API answers with the submission's new status and actions. */
export const sendSubmissionAction = async (href: string, method: string, body: unknown): Promise<z.infer<typeof submissionRecordSchema>> => {
  const verb = method.toUpperCase() === 'PATCH' ? 'PATCH' : 'POST'
  const data = await rest(streamPath(href), z.object({ artistInviteSubmissions: submissionRecordSchema }), { method: verb, body })
  return data.artistInviteSubmissions
}
