'use client'

import { useState } from 'react'
import { saveCreatorTypes } from '@/actions/profile-actions'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { CategoryOptionButton, OptionButton } from '@/components/ui/option-button'
import { TreeSection } from '@/components/settings/tree-section'
import type { CreatorTypes } from '@/services/settings'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './settings-panels.module.css'

/** The original's CreatorTypeContainer saves a second after the last click. */
const SAVE_DELAY = 1000

const toggleId = (ids: number[], id: number): number[] =>
  ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id]

/** The original's Creator Type section ("I am here as" An Artist / A Fan, then the categories you make). */
export const CreatorType = ({ categories, selectedIds }: CreatorTypes) => {
  const [ids, setIds] = useState(selectedIds)
  const [artist, setArtist] = useState(selectedIds.length > 0)
  const save = useDebouncedCallback((next: number[]): void => {
    void saveCreatorTypes(next).then((result) => {
      if (!result.ok) toast.error(result.error)
    })
  }, SAVE_DELAY)

  const pickCategory = (id: number): void => {
    const next = toggleId(ids, id)
    setIds(next)
    save(next)
  }

  const pickFan = (): void => {
    setArtist(false)
    setIds([])
    save([])
  }

  return (
    <TreeSection title="Creator Type">
      <div className={styles.creatorType}>
        <div className={cn('inSettings', styles.creatorBox)}>
          <h2 className={styles.creatorHeading}>I am here as:</h2>
          <div>
            <OptionButton active={artist} disabled={artist} onClick={() => setArtist(true)}>
              An Artist
            </OptionButton>
            <OptionButton active={!artist} disabled={!artist} onClick={pickFan}>
              A Fan
            </OptionButton>
          </div>
          {artist ? (
            <div>
              <h2 className={cn(styles.creatorHeading, styles.categoriesHeading)}>I make:</h2>
              <div className={styles.categories}>
                {categories.map((category) => {
                  const active = ids.includes(category.id)
                  return (
                    <CategoryOptionButton key={category.id} active={active} onClick={() => pickCategory(category.id)}>
                      {category.name}
                    </CategoryOptionButton>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </TreeSection>
  )
}
