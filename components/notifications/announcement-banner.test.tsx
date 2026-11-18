import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { closeAnnouncement } from '@/actions/notification-actions'
import { useAnnouncementStore } from '@/stores/announcement-store'
import { responsive } from '@/test/fixtures/media'
import type { Announcement } from '@/types/announcement'
import { AnnouncementBanner } from './announcement-banner'

jest.mock('@/actions/notification-actions', () => ({ closeAnnouncement: jest.fn().mockResolvedValue({ ok: true, data: undefined }) }))

const base: Announcement = {
  id: '9',
  header: 'Big news',
  body: 'Something happened.',
  ctaCaption: 'Read more',
  ctaHref: '/discover',
  image: responsive('https://picsum.photos/seed/a/140/140', 140, 140),
}

const show = (announcement: Announcement | null) => {
  useAnnouncementStore.setState({ announcement, lastSeenId: '0' })
  return render(<AnnouncementBanner />)
}

describe('AnnouncementBanner', () => {
  it('renders nothing without an announcement', () => {
    const { container } = show(null)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the title, body, image and an internal call to action, and counts as seen', () => {
    const { container } = show(base)
    expect(container.querySelector('.AnnouncementNotification.hasAsset')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Big news' })).toBeInTheDocument()
    expect(screen.getByText('Something happened.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute('href', '/discover')
    expect(screen.getByRole('link', { name: 'Read more' })).not.toHaveAttribute('target')
    expect(useAnnouncementStore.getState().lastSeenId).toBe('9')
  })

  it('opens an external call to action in a new tab, with a default caption', () => {
    show({ ...base, ctaHref: 'https://example.com/x', ctaCaption: null, image: null })
    const link = screen.getByRole('link', { name: 'Learn More' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('marks the staff preview', () => {
    const { container } = show({ ...base, isStaffPreview: true })
    expect(container.querySelector('.isStaffPreview')).not.toBeNull()
  })

  it('closes right away and tells the API', async () => {
    const { container } = show(base)
    await userEvent.click(container.querySelector('.js-closeAnnouncement') as HTMLElement)
    expect(useAnnouncementStore.getState().announcement).toBeNull()
    expect(closeAnnouncement).toHaveBeenCalledTimes(1)
  })
})
