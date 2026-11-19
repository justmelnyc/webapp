import {
  canPostComment,
  commentBlocksReducer,
  hasCommentContent,
  type CommentBlock,
} from './use-comment-blocks'

const text = (id: string, value = ''): CommentBlock => ({ id, kind: 'text', text: value })
const image = (id: string, status: 'uploading' | 'done' | 'error' = 'done'): CommentBlock => ({
  id,
  kind: 'image',
  previewUrl: `blob:${id}`,
  url: status === 'done' ? `http://s/${id}.png` : null,
  status,
})

describe('commentBlocksReducer', () => {
  it('replaces the empty last text block with the picture and ends on a new empty text block', () => {
    const next = commentBlocksReducer([text('t1')], {
      type: 'addImage',
      id: 'i1',
      previewUrl: 'blob:i1',
      textId: 't2',
    })
    expect(next.map((b) => `${b.kind}:${b.id}`)).toEqual(['image:i1', 'text:t2'])
  })

  it('keeps typed text before the picture', () => {
    const next = commentBlocksReducer([text('t1', 'hi')], {
      type: 'addImage',
      id: 'i1',
      previewUrl: 'blob:i1',
      textId: 't2',
    })
    expect(next.map((b) => b.kind)).toEqual(['text', 'image', 'text'])
  })

  it('removing a picture merges the two text blocks around it when the last is empty', () => {
    const next = commentBlocksReducer([text('t1', 'hi'), image('i1'), text('t2')], {
      type: 'remove',
      id: 'i1',
      textId: 't9',
    })
    expect(next).toEqual([text('t1', 'hi')])
  })

  it('removing the only block leaves one empty text block', () => {
    expect(commentBlocksReducer([text('t1')], { type: 'remove', id: 't1', textId: 't9' })).toEqual([
      text('t9'),
    ])
  })

  it('appends emoji codes to the last text block', () => {
    const next = commentBlocksReducer([image('i1'), text('t1', 'a')], {
      type: 'appendText',
      text: ':tada:',
    })
    expect(next[1]).toEqual(text('t1', 'a:tada:'))
  })

  it('moves a block and ignores moves off either end', () => {
    const blocks = [text('t1', 'a'), image('i1'), text('t2')]
    expect(
      commentBlocksReducer(blocks, { type: 'move', id: 'i1', delta: -1 }).map((b) => b.id),
    ).toEqual(['i1', 't1', 't2'])
    expect(commentBlocksReducer(blocks, { type: 'move', id: 't1', delta: -1 })).toBe(blocks)
  })
})

describe('comment block predicates', () => {
  it('has content with typed text or more than one block', () => {
    expect(hasCommentContent([text('t1')])).toBe(false)
    expect(hasCommentContent([text('t1', ' x ')])).toBe(true)
    expect(hasCommentContent([image('i1', 'uploading'), text('t2')])).toBe(true)
  })

  it('can post a lone picture, but not while it uploads or after it failed', () => {
    expect(canPostComment([image('i1'), text('t1')])).toBe(true)
    expect(canPostComment([image('i1', 'uploading'), text('t1')])).toBe(false)
    expect(canPostComment([image('i1', 'error'), text('t1', 'hi')])).toBe(false)
    expect(canPostComment([text('t1', '  ')])).toBe(false)
  })
})
