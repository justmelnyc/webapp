import { isEditorEmpty, prefixLink } from './editor-html'

describe('prefixLink', () => {
  it('adds http:// to bare hosts and keeps full urls', () => {
    expect(prefixLink('ello.co')).toBe('http://ello.co')
    expect(prefixLink('https://ello.co')).toBe('https://ello.co')
    expect(prefixLink('mailto:a@b.co')).toBe('mailto:a@b.co')
  })
})

describe('isEditorEmpty', () => {
  it('treats leftover markup as empty', () => {
    expect(isEditorEmpty('')).toBe(true)
    expect(isEditorEmpty('<br>')).toBe(true)
    expect(isEditorEmpty('&nbsp;')).toBe(true)
    expect(isEditorEmpty('hi')).toBe(false)
  })
})
