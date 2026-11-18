import { useComposerStore } from '@/stores/composer-store'

const invite = { id: '1435', title: 'Neon Nights Poster Series' }

describe('composer store: artist invite submissions', () => {
  beforeEach(() => useComposerStore.getState().reset())

  it('opens the omnibar for an invite with an empty draft (no prefilled text)', () => {
    useComposerStore.getState().openForInvite(invite)
    const state = useComposerStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.artistInvite).toEqual(invite)
    expect(state.blocks).toHaveLength(1)
    expect(state.blocks[0]).toMatchObject({ kind: 'text', text: '' })
  })

  it('shows the success message after a submission and clears the draft and invite', () => {
    useComposerStore.getState().openForInvite(invite)
    useComposerStore.getState().finishInviteSubmission()
    const state = useComposerStore.getState()
    expect(state).toMatchObject({ isOpen: true, inviteSuccess: true, artistInvite: null, blocks: [] })
  })

  it('closes on dismiss, and reset or close forget the message', () => {
    useComposerStore.getState().finishInviteSubmission()
    useComposerStore.getState().dismissInviteSuccess()
    expect(useComposerStore.getState()).toMatchObject({ isOpen: false, inviteSuccess: false })
    useComposerStore.getState().finishInviteSubmission()
    useComposerStore.getState().close()
    expect(useComposerStore.getState().inviteSuccess).toBe(false)
  })
})
