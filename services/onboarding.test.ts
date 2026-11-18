import { toOnboardingCategories } from './onboarding'

const category = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: `Category ${id}`,
  slug: `category-${id}`,
  allowInOnboarding: true,
  ...extra,
})

describe('toOnboardingCategories', () => {
  it('keeps only categories that are allowed in onboarding', () => {
    const result = toOnboardingCategories([category('1'), category('2', { allowInOnboarding: false }), category('3', { allowInOnboarding: null })])
    expect(result.map((c) => c.id)).toEqual(['1'])
  })

  it('orders by the category order', () => {
    const result = toOnboardingCategories([category('1', { order: 2 }), category('2', { order: 0 }), category('3', { order: 1 })])
    expect(result.map((c) => c.id)).toEqual(['2', '3', '1'])
  })

  it('reads the large tile image', () => {
    const [first, second] = toOnboardingCategories([category('1', { tileImage: { large: { url: 'http://x/y.jpg' } } }), category('2')])
    expect(first?.imageUrl).toBe('http://x/y.jpg')
    expect(second?.imageUrl).toBeNull()
  })
})
