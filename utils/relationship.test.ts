import { getNextBlockMutePriority, isBlockedOrMuted } from '@/utils/relationship'

describe('getNextBlockMutePriority', () => {
  it('applies the requested priority when nothing is set', () => {
    expect(getNextBlockMutePriority('none', 'block')).toBe('block')
    expect(getNextBlockMutePriority('friend', 'mute')).toBe('mute')
    expect(getNextBlockMutePriority(null, 'mute')).toBe('mute')
  })

  it('lifts an existing block or mute, whichever button was pressed', () => {
    expect(getNextBlockMutePriority('block', 'block')).toBe('inactive')
    expect(getNextBlockMutePriority('block', 'mute')).toBe('inactive')
    expect(getNextBlockMutePriority('mute', 'block')).toBe('inactive')
  })
})

describe('isBlockedOrMuted', () => {
  it('is true only for block and mute', () => {
    expect(isBlockedOrMuted('block')).toBe(true)
    expect(isBlockedOrMuted('mute')).toBe(true)
    expect(isBlockedOrMuted('friend')).toBe(false)
    expect(isBlockedOrMuted(undefined)).toBe(false)
  })
})
