import type { Metadata } from 'next'
import { ArtistInviteList } from '@/components/artist-invites/artist-invite-list'
import { Hero } from '@/components/layout/hero'
import { getPageHeader } from '@/services/content'
import { getArtistInvites } from '@/services/artist-invites'

export const metadata: Metadata = { title: 'Invites' }

/** Port of pages/ArtistInvitesPage.js: the ARTIST_INVITE hero, then the invites as cards. */
const ArtistInvitesPage = async () => {
  const [header, invites] = await Promise.all([getPageHeader('ARTIST_INVITE').catch(() => null), getArtistInvites()])
  return (
    <div className="ArtistInvites">
      {header && <Hero header={header} />}
      <ArtistInviteList invites={invites} />
    </div>
  )
}

export default ArtistInvitesPage
