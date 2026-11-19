import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Comment } from '@/types/post'
import { CommentEditForm } from './comment-edit-form'

const updateComment = jest.fn()
const uploadImage = jest.fn()

jest.mock('@/actions/comment-actions', () => ({
  updateComment: (...args: unknown[]) => updateComment(...args),
}))
jest.mock('@/actions/emoji-actions', () => ({
  fetchEmojis: jest.fn().mockResolvedValue({
    ok: true,
    data: {
      origin: 'http://api',
      emojis: ['smile', 'tada'].map((name) => ({
        name,
        imageUrl: `http://api/images/emoji/${name}.png`,
      })),
    },
  }),
}))
jest.mock('@/lib/client/upload', () => ({
  uploadImage: (file: File) => uploadImage(file),
  validateImage: () => null,
}))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn(), info: jest.fn() } }))

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:preview')
  URL.revokeObjectURL = jest.fn()
})

const withPicture = {
  id: 'c9',
  createdAt: new Date().toISOString(),
  author: { id: 'u1', username: 'ada', avatar: null },
  content: [
    { kind: 'text', data: '<p>Look</p>' },
    { kind: 'image', data: { url: 'http://s/a.png', alt: 'A cat' } },
  ],
} as unknown as Comment

const renderEdit = (comment: Comment = withPicture, onSaved = jest.fn()) =>
  render(<CommentEditForm postId="p1" comment={comment} onSaved={onSaved} onCancel={jest.fn()} />)

beforeEach(() => {
  updateComment.mockReset()
  uploadImage.mockReset()
  updateComment.mockResolvedValue({ ok: true, data: undefined })
})

describe('CommentEditForm', () => {
  it('pre-fills the text and the existing picture, ending on an empty text block', () => {
    renderEdit()
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveValue('Look')
    expect(document.querySelector('.editor-region img')).toHaveAttribute('src', 'http://s/a.png')
    expect(document.querySelectorAll('.editor-block')).toHaveLength(3)
  })

  it('saves the pictures it already had, in order, keeping their alt text', async () => {
    const onSaved = jest.fn()
    renderEdit(withPicture, onSaved)
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(updateComment).toHaveBeenCalledWith('p1', 'c9', [
      { kind: 'text', text: 'Look' },
      { kind: 'image', url: 'http://s/a.png', alt: 'A cat' },
    ])
  })

  it('removes an existing picture after the confirmation', async () => {
    renderEdit()
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1] as HTMLElement)
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Yes' }),
    )
    expect(document.querySelector('.editor-region img')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))
    await waitFor(() =>
      expect(updateComment).toHaveBeenCalledWith('p1', 'c9', [{ kind: 'text', text: 'Look' }]),
    )
  })

  it('uploads another picture and saves it after the existing ones', async () => {
    uploadImage.mockResolvedValue('http://s/b.png')
    renderEdit()
    await userEvent.upload(
      screen.getByLabelText('Choose images'),
      new File(['x'], 'b.png', { type: 'image/png' }),
    )
    const update = screen.getByRole('button', { name: 'Update' })
    await waitFor(() => expect(update).toBeEnabled())
    await userEvent.click(update)
    await waitFor(() =>
      expect(updateComment).toHaveBeenCalledWith('p1', 'c9', [
        { kind: 'text', text: 'Look' },
        { kind: 'image', url: 'http://s/a.png', alt: 'A cat' },
        { kind: 'image', url: 'http://s/b.png' },
      ]),
    )
  })

  it('has the quick emoji and the `:` completer', async () => {
    renderEdit()
    await userEvent.click(screen.getByRole('button', { name: 'Add emoji' }))
    const choices = document.querySelectorAll<HTMLButtonElement>('button[name]')
    expect(choices).toHaveLength(4)
    const name = choices[0]?.name ?? ''
    await userEvent.click(choices[0] as HTMLButtonElement)
    const textarea = screen.getAllByRole('textbox')[1] as HTMLTextAreaElement
    expect(textarea).toHaveValue(`:${name}:`) // goes to the last text block, like the original
    await userEvent.type(textarea, ' :sm')
    await userEvent.click(await screen.findByRole('button', { name: /:smile:$/ }))
    expect(textarea.value).toMatch(/ :smile:$/)
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('Look')
  })
})
