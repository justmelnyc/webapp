import { PageOffset } from '@/components/layout/page-offset'
import { SearchControl, type SearchType } from '@/components/profile/search-control'
import { searchUserCards } from '@/components/profile/user-card-data'
import { UserGrid } from '@/components/profile/user-grid'
import { PostStream } from '@/components/streams/post-stream'
import { getSession } from '@/lib/session'
import { fetchStream } from '@/services/streams'
import type { StreamSpec } from '@/types/stream'
import styles from '@/components/profile/search-control.module.css'

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[]; terms?: string | string[]; type?: string | string[] }>
}

const MIN_TERMS = 2
const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value)?.trim() ?? ''

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams
  const query = first(params.q) || first(params.terms)
  const type: SearchType = first(params.type) === 'users' ? 'users' : 'posts'
  const searching = query.length >= MIN_TERMS
  const spec: StreamSpec = { type: 'search', terms: query }
  const [users, page, session] = await Promise.all([
    searching && type === 'users' ? searchUserCards(query) : [],
    searching && type === 'posts' ? fetchStream(spec) : null,
    getSession(),
  ])
  const noResults = searching && (type === 'users' ? users.length === 0 : page?.posts.length === 0)

  return (
    <>
      <PageOffset>{null}</PageOffset>
      <div className={`Search ${styles.view}`}>
        <SearchControl query={query} type={type} />
        {noResults ? (
          <section className="StreamContainer empty">
            <div className={`ZeroState ${styles.empty}`}>Sorry, no results found.</div>
          </section>
        ) : null}
        {users.length > 0 ? <UserGrid users={users} signedIn={!!session} /> : null}
        {page && page.posts.length > 0 ? (
          <PostStream spec={spec} initialPage={page} signedIn={!!session} viewerId={session?.id ?? null} />
        ) : null}
      </div>
    </>
  )
}

export default SearchPage
