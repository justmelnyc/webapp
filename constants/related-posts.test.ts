import { RELATED_POSTS_MAX, relatedColumnCount, relatedPostsPerPage } from './related-posts'

describe('related posts layout', () => {
  it('asks for one row: the column count, less one from three columns up', () => {
    expect([2, 3, 4, 5, 6, 7].map(relatedPostsPerPage)).toEqual([2, 2, 3, 4, 5, 6])
    expect(relatedPostsPerPage(7)).toBe(RELATED_POSTS_MAX)
  })

  it('deals them into the column count, less one from four columns up', () => {
    expect([2, 3, 4, 5, 6, 7].map(relatedColumnCount)).toEqual([2, 3, 3, 4, 5, 6])
  })
})
