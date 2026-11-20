import { useCategoryDrawerStore } from './category-drawer-store'

describe('category drawer store', () => {
  it('starts closed and remembers what it was set to', () => {
    expect(useCategoryDrawerStore.getState().isOpen).toBe(false)
    useCategoryDrawerStore.getState().setOpen(true)
    expect(useCategoryDrawerStore.getState().isOpen).toBe(true)
    useCategoryDrawerStore.getState().setOpen(false)
    expect(useCategoryDrawerStore.getState().isOpen).toBe(false)
  })
})
