import { PageOffset } from '@/components/layout/page-offset'
import { SearchControl, type SearchType } from '@/components/profile/search-control'
import { searchUserCards } from '@/components/profile/user-card-data'
import { UserGrid } from '@/components/profile/user-grid'
import { getSession } from '@/lib/session'
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
  // Only people can be searched against this API; the original's default Posts tab finds nothing here too.
  const [users, session] = await Promise.all([searching && type === 'users' ? searchUserCards(query) : [], getSession()])

  return (
    <>
      <PageOffset>{null}</PageOffset>
      <div className={`Search ${styles.view}`}>
        <SearchControl query={query} type={type} />
        {searching && users.length === 0 ? (
          <section className="StreamContainer empty">
            <div className={`ZeroState ${styles.empty}`}>Sorry, no results found.</div>
          </section>
        ) : null}
        {users.length > 0 ? <UserGrid users={users} signedIn={!!session} /> : null}
      </div>
    </>
  )
}

export default SearchPage
