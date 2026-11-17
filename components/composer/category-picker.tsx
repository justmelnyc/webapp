'use client'

import { useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'
import { cn } from '@/utils/cn'

export const CategoryPicker = ({ categories }: { categories: Category[] }) => {
  const selected = useComposerStore((s) => s.categoryIds)
  const toggle = useComposerStore((s) => s.toggleCategory)
  if (categories.length === 0) return null
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-slate mb-2 text-xs uppercase">Categories (optional)</legend>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const on = selected.includes(c.id)
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                on ? 'bg-ink text-paper border-ink' : 'border-stone text-slate hover:border-ink',
              )}
            >
              {c.name}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
