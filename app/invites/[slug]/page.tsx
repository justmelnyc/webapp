import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArtistInviteDetail } from '@/components/artist-invites/artist-invite-detail'
import { InviteRedirect } from '@/components/artist-invites/invite-redirect'
import { PageOffset } from '@/components/layout/page-offset'
import { isApiError } from '@/lib/errors'
import { getArtistInvite } from '@/services/artist-invites'
import type { ArtistInvite } from '@/types/artist-invite'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ submissionType?: string }>
}

const load = async (slug: string): Promise<ArtistInvite> => {
  try {
    return await getArtistInvite(slug)
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound()
    throw error
  }
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const invite = await load(slug)
  return { title: invite.title }
}

/** Port of pages/ArtistInvitesDetailPage.js. Invites hosted elsewhere open the partner's site in a new tab and return to /invites. */
const ArtistInviteDetailPage = async ({ params, searchParams }: Props) => {
  const [{ slug }, { submissionType }] = await Promise.all([params, searchParams])
  const invite = await load(slug)
  if (invite.redirectUrl) return <InviteRedirect url={invite.redirectUrl} />
  return (
    <PageOffset className="ArtistInvitesDetail">
      <ArtistInviteDetail invite={invite} submissionType={submissionType} />
    </PageOffset>
  )
}

export default ArtistInviteDetailPage
