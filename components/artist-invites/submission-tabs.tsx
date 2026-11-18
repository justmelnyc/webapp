'use client'

import Link from 'next/link'
import { useState } from 'react'
import { XIcon } from '@/components/icons'
import { useMediaQuery } from '@/components/layout/use-media-query'
import type { SubmissionKey } from '@/types/artist-invite'
import { cn } from '@/utils/cn'
import { submissionTabLabel } from '@/utils/artist-invite'
import styles from './submissions.module.css'
import tabStyles from './submission-tab-items.module.css'

const EXPLAINERS: Record<SubmissionKey, string> = {
  unapprovedSubmissions: 'Submissions to be Accepted or Declined. Not publicly visible.',
  approvedSubmissions:
    'Accepting a submission sends an email to the artist letting them know you have received their work. It also notifies the followers of the artist that their submission was accepted for further consideration. Accepting a submission makes it publicly visible on the Invite.',
  selectedSubmissions:
    'Submissions may be “selected” at any point during the submission period. We recommend using this tab to save top submissions for final review when the Invite closes. You can remove submissions from the Selected tab by toggling the selected icon. All selected submissions will remain visible on the Accepted tab while selected. Not publicly visible.',
  declinedSubmissions: 'We encourage only declining work that is incomplete, inappropriate, or extremely off-brand. Not publicly visible.',
}

export interface SubmissionTab {
  key: SubmissionKey
  label: string
}

/** The curator's four stream tabs under "Submissions —", each with a short explainer (a `?` toggle on phones). */
export const SubmissionTabs = ({ tabs, selected }: { tabs: SubmissionTab[]; selected: SubmissionKey }) => {
  const isNarrow = useMediaQuery('(max-width: 39.9375em)')
  const [openKey, setOpenKey] = useState<SubmissionKey | null>(null)
  return (
    <div className={cn(styles.titleWrapper, styles.tabs)}>
      <h2 className={styles.title}>Submissions —</h2>
      <ul>
        {tabs.map(({ key, label }) => {
          const isOpen = openKey === key
          return (
            <li key={key}>
              <Link
                href={`?submissionType=${key}`}
                scroll={false}
                className={cn(tabStyles.tab, tabStyles[key], key === selected && tabStyles.active)}
              >
                <span className={tabStyles.label}>
                  {submissionTabLabel(label)}
                  {isNarrow && (
                    <button
                      type="button"
                      className={cn(tabStyles.toggle, isOpen && tabStyles.open)}
                      onClick={(event) => {
                        event.preventDefault()
                        setOpenKey(isOpen ? null : key)
                      }}
                    >
                      <span className={tabStyles.question}>?</span>
                      <XIcon />
                    </button>
                  )}
                </span>
                <span className={cn(tabStyles.explainer, isNarrow && isOpen && tabStyles.open)}>{EXPLAINERS[key]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
