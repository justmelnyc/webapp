import { gqlAuthor, gqlPost, imageRegion, textRegion } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { authorSchema } from '@/types/user'
import { activityPath, splitSummary, summaryRegions, tabPath } from './notification-parts'

const post = postSchema.parse(gqlPost('p1'))
const author = authorSchema.parse(gqlAuthor('ada'))

describe('activityPath', () => {
  it('links to the post, then the user, then home', () => {
    expect(activityPath(author, post)).toBe('/ada/post/tokp1')
    expect(activityPath(author)).toBe('/ada')
    expect(activityPath(null, post)).toBe('/')
  })
})

describe('summaryRegions / splitSummary', () => {
  it('keeps the post summary and appends a rule and the comment for comment notifications', () => {
    const comment = { content: [textRegion('<p>Nice</p>')] }
    const regions = summaryRegions(post, comment)
    expect(regions.map((r) => r.kind)).toEqual(['text', 'image', 'rule', 'text'])
  })

  it('takes the first image as the thumbnail and keeps text and rules in order', () => {
    const regions = [textRegion('<p>a</p>'), imageRegion('x'), { kind: 'rule' as const }, imageRegion('y')]
    const { image, texts } = splitSummary(regions)
    expect(image?.kind === 'image' && image.links?.assets).toBe('x')
    expect(texts.map((r) => r.kind)).toEqual(['text', 'rule'])
  })

  it('takes an embed as the thumbnail when it comes first', () => {
    const embed = { kind: 'embed' as const, data: { service: 'vimeo', id: '1' } }
    expect(splitSummary([textRegion(), embed, imageRegion('x')]).image).toBe(embed)
    expect(splitSummary([imageRegion('x'), embed]).image?.kind).toBe('image')
  })

  it('has no thumbnail when the summary has no image', () => {
    expect(splitSummary([textRegion()]).image).toBeNull()
  })
})

describe('tabPath', () => {
  it('serves all at the bare path', () => {
    expect(tabPath('all')).toBe('/notifications')
    expect(tabPath('loves')).toBe('/notifications/loves')
  })
})
