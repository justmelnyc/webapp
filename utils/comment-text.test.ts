import { commentToHtml } from '@/lib/schemas/comment'
import { commentHtmlToText } from './comment-text'

describe('commentHtmlToText', () => {
  it('round-trips what commentToHtml produces', () => {
    const text = 'Hi <b>there</b> & "you"\nnext line\n\nNew paragraph\'s end'
    expect(commentHtmlToText(commentToHtml(text))).toBe(text)
  })

  it('drops other tags and does not double-decode', () => {
    expect(commentHtmlToText('<p>a <a href="/x">link</a> &amp;lt;</p>')).toBe('a link &lt;')
  })
})
