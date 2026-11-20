'use client'

import { createContext, useContext, type ReactNode } from 'react'

const StaffContext = createContext(false)

/** Tells the tree below whether the signed-in user is Ello staff (the original's `selectIsStaff`). */
export const StaffProvider = ({ isStaff, children }: { isStaff: boolean; children: ReactNode }) => (
  <StaffContext value={isStaff}>{children}</StaffContext>
)

/** Whether the viewer is staff; false when logged out or outside a provider. */
export const useIsStaff = (): boolean => useContext(StaffContext)
