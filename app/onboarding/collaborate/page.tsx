import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CollaborateStep } from '@/components/onboarding/collaborate-step'
import { requireSession } from '@/lib/require-session'
import { getViewer } from '@/services/viewer'

export const metadata: Metadata = { title: 'Welcome' }

const CollaboratePage = async () => {
  await requireSession('/onboarding/collaborate')
  const viewer = await getViewer()
  if (!viewer) redirect('/enter?next=%2Fonboarding%2Fcollaborate')
  return <CollaborateStep initial={{ is_hireable: viewer.isHireable === true, is_collaborateable: viewer.isCollaborateable === true }} />
}

export default CollaboratePage
