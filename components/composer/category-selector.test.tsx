import { render, screen } from '@testing-library/react'
import { CategorySelector } from '@/components/composer/category-selector'
import { useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'

const categories = [
  { id: '1', name: 'Art', slug: 'art' },
  { id: '2', name: 'Photography', slug: 'photography' },
] as Category[]

beforeEach(() => useComposerStore.getState().reset())

describe('CategorySelector', () => {
  it('shows "Choose Category" when the viewer curates nothing', () => {
    render(<CategorySelector categories={categories} />)
    expect(screen.getByText('Choose Category')).toBeInTheDocument()
    expect(useComposerStore.getState().categoryIds).toEqual([])
  })

  it('preselects the first curated category it knows, like the original', () => {
    render(<CategorySelector categories={categories} featuredCategoryIds={['9', '2', '1']} />)
    expect(screen.getByText('Photography')).toBeInTheDocument()
    expect(screen.getByText('Post into:')).toBeInTheDocument()
    expect(useComposerStore.getState().categoryIds).toEqual(['2'])
  })

  it('keeps an edited post\'s own category', () => {
    useComposerStore.getState().startEdit('p1', [], ['1'], '')
    render(<CategorySelector categories={categories} featuredCategoryIds={['2']} />)
    expect(useComposerStore.getState().categoryIds).toEqual(['1'])
  })
})
