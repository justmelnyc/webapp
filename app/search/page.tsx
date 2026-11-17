import { UserList } from '@/components/profile/user-list'
import { searchUsers } from '@/services/users'

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const results = query ? await searchUsers(query) : []
  const items = results.map(({ formattedShortBio, ...user }) => ({ ...user, bio: formattedShortBio }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-medium">Search people</h1>
      <form action="/search" method="get" role="search" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name or username"
          aria-label="Search people"
          className="border-stone focus:border-ink min-w-0 flex-1 rounded-sm border px-3 py-2 outline-none"
        />
        <button type="submit" className="bg-ink text-paper rounded-sm px-4 py-2 text-sm font-medium">
          Search
        </button>
      </form>
      {!query ? (
        <p className="text-ash">Type a name or username to find people.</p>
      ) : (
        <UserList users={items} emptyMessage={`No people found for "${query}".`} />
      )}
    </div>
  )
}

export default SearchPage
