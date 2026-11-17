import { SearchControl } from '@/components/profile/search-control'
import { searchUserCards } from '@/components/profile/user-card-data'
import { UserGrid } from '@/components/profile/user-grid'
import { getSession } from '@/lib/session'
import styles from '@/components/profile/search-control.module.css'

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[]; terms?: string | string[] }>
}

const MIN_TERMS = 2
const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value)?.trim() ?? ''

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams
  const query = first(params.q) || first(params.terms)
  const searching = query.length >= MIN_TERMS
  const [users, session] = await Promise.all([searching ? searchUserCards(query) : [], getSession()])

  return (
    <div className={`Search ${styles.view}`}>
      <SearchControl query={query} />
      {searching && users.length === 0 ? (
        <section className="StreamContainer empty">
          <div className={`ZeroState ${styles.empty}`}>Sorry, no results found.</div>
        </section>
      ) : null}
      {users.length > 0 ? <UserGrid users={users} signedIn={!!session} /> : null}
    </div>
  )
}

export default SearchPage
