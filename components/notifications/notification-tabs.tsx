'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { BubbleIcon, HeartIcon, RelationshipIcon, RepostIcon } from '@/components/icons'
import type { NotificationTab } from '@/types/notification'
import { cn } from '@/utils/cn'
import { tabPath } from './notification-parts'
import './notifications.css'

export const NOTIFICATION_TABS: { type: NotificationTab; children: ReactNode }[] = [
  { type: 'all', children: 'All' },
  { type: 'comments', children: <BubbleIcon /> },
  { type: 'mentions', children: '@' },
  { type: 'loves', children: <HeartIcon /> },
  { type: 'reposts', children: <RepostIcon /> },
  { type: 'relationships', children: <RelationshipIcon /> },
]

/** Tabs as links (the /notifications page): the original's `TabListLinks`. */
export const NotificationTabLinks = ({ active }: { active: NotificationTab }) => (
  <nav className="IconTabList NotificationsContainerTabs TabListLinks">
    {NOTIFICATION_TABS.map(({ type, children }) => (
      <Link key={type} href={tabPath(type)} className={cn('IconTab TabLink', type === active && 'isActive')}>
        {children}
      </Link>
    ))}
  </nav>
)

/** Tabs as buttons (the navbar dropdown): the original's `TabListButtons`. */
export const NotificationTabButtons = ({ active, onSelect }: { active: NotificationTab; onSelect: (tab: NotificationTab) => void }) => (
  <nav className="IconTabList NotificationsContainerTabs TabListButtons">
    {NOTIFICATION_TABS.map(({ type, children }) => (
      <button key={type} type="button" className={cn('IconTab TabButton', type === active && 'isActive')} onClick={() => onSelect(type)}>
        {children}
      </button>
    ))}
  </nav>
)
