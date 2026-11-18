'use client'

import { ArrowIcon } from '@/components/icons'
import { BlackBorderRoundedRect, GreenBorderRoundedRect } from '@/components/ui/rounded-rect'

const scrollToSubmissions = (): void => {
  const target = document.querySelector<HTMLElement>('.Submissions')
  if (target) window.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
}

/** "See Submissions" under the status; scrolls to the stream below. */
export const SeeSubmissionsButton = () => (
  <GreenBorderRoundedRect className="ScrollButton GreenBorder" onClick={scrollToSubmissions}>
    <ArrowIcon />
    See Submissions
  </GreenBorderRoundedRect>
)

/** Shown by the original while the submissions were still loading. */
export const LoadingSubmissionsButton = () => (
  <BlackBorderRoundedRect className="ScrollButton BlackBorder" onClick={scrollToSubmissions}>
    Loading Submissions…
  </BlackBorderRoundedRect>
)
