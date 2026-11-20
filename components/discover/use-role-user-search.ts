'use client'

import { useCallback, useRef, useState } from 'react'
import { searchRoleUsers } from '@/actions/category-actions'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import type { QuickSearchUser } from '@/types/category'

interface RoleUserSearch {
  users: QuickSearchUser[]
  /** Look up users for what was typed (after 200ms without typing); an empty text clears the results. */
  search: (text: string) => void
  clear: () => void
}

/** The add-role dialog's user lookup (`userQuickSearch` / `clearQuickSearch`). */
export const useRoleUserSearch = (): RoleUserSearch => {
  const [users, setUsers] = useState<QuickSearchUser[]>([])
  // only the answer to the latest request may land
  const latest = useRef(0)

  const run = useDebouncedCallback((text: string, request: number) => {
    void searchRoleUsers(text).then((result) => {
      if (request === latest.current && result.ok) setUsers(result.data)
    })
  }, 200)

  const clear = useCallback(() => {
    latest.current += 1
    setUsers([])
  }, [])

  const search = useCallback(
    (text: string) => {
      if (text === '') return clear()
      latest.current += 1
      run(text, latest.current)
    },
    [clear, run],
  )

  return { users, search, clear }
}
