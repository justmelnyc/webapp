import { useProfileRolesStore } from './profile-roles-store'

describe('profile roles store', () => {
  it('opens and closes the roles panel', () => {
    expect(useProfileRolesStore.getState().isOpen).toBe(false)
    useProfileRolesStore.getState().setOpen(true)
    expect(useProfileRolesStore.getState().isOpen).toBe(true)
    useProfileRolesStore.getState().setOpen(false)
    expect(useProfileRolesStore.getState().isOpen).toBe(false)
  })
})
