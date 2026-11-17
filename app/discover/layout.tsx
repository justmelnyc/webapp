import type { ReactNode } from 'react'
import { DiscoverTabs } from '@/components/layout/discover-tabs'

const DiscoverLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-8">
    <DiscoverTabs />
    {children}
  </div>
)

export default DiscoverLayout
