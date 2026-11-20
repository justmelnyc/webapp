import { render, screen } from '@testing-library/react'
import { NotificationTabLinks } from './notification-tabs'

const activeHrefs = (): (string | null)[] =>
  screen.getAllByRole('link').filter((link) => link.classList.contains('isActive')).map((link) => link.getAttribute('href'))

describe('NotificationTabLinks', () => {
  it('links the six tabs, all at the bare path', () => {
    render(<NotificationTabLinks active="all" />)
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/notifications',
      '/notifications/comments',
      '/notifications/mentions',
      '/notifications/loves',
      '/notifications/reposts',
      '/notifications/relationships',
    ])
    expect(activeHrefs()).toEqual(['/notifications'])
  })

  it('lights the tab whose path is open', () => {
    render(<NotificationTabLinks active="loves" />)
    expect(activeHrefs()).toEqual(['/notifications/loves'])
  })

  it('lights none at /notifications/all, which is no tab’s path', () => {
    render(<NotificationTabLinks active={null} />)
    expect(activeHrefs()).toEqual([])
  })
})
