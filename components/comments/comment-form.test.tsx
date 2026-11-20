import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentForm } from '@/components/comments/comment-form'

const fetchCommenterUsernames = jest.fn()
const createCommentFromBlocks = jest.fn()
const uploadImage = jest.fn()

jest.mock('@/actions/comment-actions', () => ({
  fetchCommenterUsernames: (postId: string) => fetchCommenterUsernames(postId),
}))
jest.mock('@/actions/comment-post-actions', () => ({
  createCommentFromBlocks: (postId: string, regions: unknown) =>
    createCommentFromBlocks(postId, regions),
}))
jest.mock('@/actions/emoji-actions', () => ({
  fetchEmojis: jest.fn().mockResolvedValue({
    ok: true,
    data: {
      origin: 'http://api',
      emojis: ['smile', 'tada', 'sparkles'].map((name) => ({
        name,
        imageUrl: `http://api/images/emoji/${name}.png`,
      })),
    },
  }),
}))
jest.mock('@/lib/client/upload', () => ({
  uploadImage: (file: File) => uploadImage(file),
  validateImage: (file: File) =>
    file.type.startsWith('image/') ? null : 'We support .jpg, .png, .gif, .webp and .bmp files.',
}))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn(), info: jest.fn() } }))

const renderForm = (showReplyAll = false, onCreated = jest.fn()) =>
  render(<CommentForm postId="p1" onCreated={onCreated} showReplyAll={showReplyAll} />)

const png = (name = 'pic.png'): File => new File(['x'], name, { type: 'image/png' })

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:preview')
  URL.revokeObjectURL = jest.fn()
})

describe('CommentForm Reply All', () => {
  beforeEach(() => fetchCommenterUsernames.mockReset())

  it('has no Reply All button unless the viewer owns a post that has comments', () => {
    renderForm(false)
    expect(screen.queryByRole('button', { name: 'Reply All' })).toBeNull()
  })

  it('appends every commenter once, like the original appendUsernames', async () => {
    fetchCommenterUsernames.mockResolvedValue({ ok: true, data: ['yuki', 'noor'] })
    renderForm(true)
    const textarea = screen.getByRole('textbox', { name: 'Comment' })
    await userEvent.type(textarea, 'Thanks ')
    await userEvent.click(screen.getByRole('button', { name: 'Reply All' }))
    await waitFor(() => expect(textarea).toHaveValue('Thanks @yuki @noor '))
    await userEvent.click(screen.getByRole('button', { name: 'Reply All' }))
    await waitFor(() => expect(fetchCommenterUsernames).toHaveBeenCalledTimes(2))
    expect(textarea).toHaveValue('Thanks @yuki @noor ')
  })
})

describe('CommentForm cancel', () => {
  it('asks "Cancel comment?" and only then empties the editor and tells the owner', async () => {
    const onCancel = jest.fn()
    render(<CommentForm postId="p1" onCreated={jest.fn()} onCancel={onCancel} />)
    const textarea = screen.getByRole('textbox', { name: 'Comment' })
    await userEvent.type(textarea, 'Draft')
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[0] as HTMLElement)
    const dialog = screen.getByRole('dialog', { name: 'Cancel comment?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'No' }))
    expect(textarea).toHaveValue('Draft')
    expect(onCancel).not.toHaveBeenCalled()
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[0] as HTMLElement)
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Cancel comment?' })).getByRole('button', { name: 'Yes' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveValue('')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

describe('CommentForm emoji', () => {
  it('quick emoji opens four choices and adds the clicked one to the text', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Add emoji' }))
    const choices = document.querySelectorAll<HTMLButtonElement>('button[name]')
    expect(choices).toHaveLength(4)
    const name = choices[0]?.name ?? ''
    await userEvent.click(choices[0] as HTMLButtonElement)
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveValue(`:${name}:`)
    expect(document.querySelectorAll('button[name]')).toHaveLength(0)
  })

  it('suggests emoji for a `:partial` word and Enter completes the first one', async () => {
    renderForm()
    const textarea = screen.getByRole('textbox', { name: 'Comment' })
    await userEvent.type(textarea, 'hi :sm')
    const list = await screen.findAllByRole('button', { name: /:\w+:$/ })
    expect(list.map((b) => b.textContent)).toEqual([':smile:'])
    await userEvent.keyboard('{Enter}')
    expect(textarea).toHaveValue('hi :smile:')
    expect(screen.queryByRole('button', { name: /:smile:$/ })).toBeNull()
  })

  it('Escape closes the completer and a click on a suggestion completes it', async () => {
    renderForm()
    const textarea = screen.getByRole('textbox', { name: 'Comment' })
    await userEvent.type(textarea, ':s')
    expect((await screen.findAllByRole('button', { name: /:\w+:$/ })).length).toBe(2)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: /:smile:$/ })).toBeNull()
    await userEvent.type(textarea, 'p')
    await userEvent.click(await screen.findByRole('button', { name: /:sparkles:$/ }))
    expect(textarea).toHaveValue(':sparkles:')
  })
})

describe('CommentForm images', () => {
  beforeEach(() => {
    createCommentFromBlocks.mockReset()
    uploadImage.mockReset()
    createCommentFromBlocks.mockResolvedValue({ ok: true, data: { id: 'c1' } })
  })

  it('posts text-only comments as one text region', async () => {
    const onCreated = jest.fn()
    renderForm(false, onCreated)
    await userEvent.type(screen.getByRole('textbox', { name: 'Comment' }), 'Hello')
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }))
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(createCommentFromBlocks).toHaveBeenCalledWith('p1', [{ kind: 'text', text: 'Hello' }])
  })

  it('uploads a picked image, shows it in the editor and posts it after the text', async () => {
    uploadImage.mockResolvedValue('http://s/a.png')
    renderForm()
    await userEvent.type(screen.getByRole('textbox', { name: 'Comment' }), 'Look')
    await userEvent.upload(screen.getByLabelText('Choose images'), png())
    const submit = screen.getByRole('button', { name: 'Comment' })
    expect(document.querySelector('.editor-region img')).toHaveAttribute('src', 'blob:preview')
    await waitFor(() => expect(submit).toBeEnabled())
    expect(document.querySelectorAll('.editor-block')).toHaveLength(3) // text, image, empty text
    await userEvent.click(submit)
    await waitFor(() =>
      expect(createCommentFromBlocks).toHaveBeenCalledWith('p1', [
        { kind: 'text', text: 'Look' },
        { kind: 'image', url: 'http://s/a.png' },
      ]),
    )
  })

  it('cannot be posted while the upload runs, and a picture alone is enough', async () => {
    let finish: (url: string) => void = () => undefined
    uploadImage.mockReturnValue(
      new Promise<string>((resolve) => {
        finish = resolve
      }),
    )
    renderForm()
    await userEvent.upload(screen.getByLabelText('Choose images'), png())
    expect(screen.getByRole('status', { name: 'Uploading' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comment' })).toBeDisabled()
    finish('http://s/b.png')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Comment' })).toBeEnabled())
    expect(screen.queryByRole('button', { name: 'Add emoji' })).toBeNull() // the first block is the picture now
  })

  it('removes a picture after the confirmation', async () => {
    uploadImage.mockResolvedValue('http://s/c.png')
    renderForm()
    await userEvent.upload(screen.getByLabelText('Choose images'), png())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Comment' })).toBeEnabled())
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0] as HTMLElement)
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Yes' }),
    )
    expect(document.querySelector('.editor-region img')).toBeNull()
    expect(screen.getByRole('button', { name: 'Comment' })).toBeDisabled()
  })

  it('refuses files that are not images', async () => {
    renderForm()
    await userEvent.upload(
      screen.getByLabelText('Choose images'),
      new File(['x'], 'a.txt', { type: 'text/plain' }),
      { applyAccept: false },
    )
    expect(uploadImage).not.toHaveBeenCalled()
    expect(document.querySelector('.editor-region img')).toBeNull()
  })
})
