import { useNotificationsStore } from './notifications-store'

describe('notifications store', () => {
  beforeEach(() => useNotificationsStore.setState({ isActive: false, isUnread: false, activeTab: 'all' }))

  it('tracks the dropdown, the unread dot and the last tab', () => {
    const { setActive, setUnread, setActiveTab } = useNotificationsStore.getState()
    setActive(true)
    setUnread(true)
    setActiveTab('loves')
    expect(useNotificationsStore.getState()).toMatchObject({ isActive: true, isUnread: true, activeTab: 'loves' })
    setUnread(false)
    expect(useNotificationsStore.getState().isUnread).toBe(false)
  })
})
