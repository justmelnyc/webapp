import type { z } from 'zod'
import type { userStatsSchema } from '@/types/user'

type Stats = z.infer<typeof userStatsSchema>

const format = (n: number): string => new Intl.NumberFormat('en', { notation: 'compact' }).format(n)

export const ProfileStats = ({ stats }: { stats: Stats }) => {
  const items = [
    ['Posts', stats.postsCount],
    ['Followers', stats.followersCount],
    ['Following', stats.followingCount],
    ['Loves', stats.lovesCount],
    ['Views', stats.totalViewsCount],
  ] as const
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <dd className="font-medium">{format(value)}</dd>
          <dt className="text-ash text-sm">{label}</dt>
        </div>
      ))}
    </dl>
  )
}
