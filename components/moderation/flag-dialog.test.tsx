import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlagDialog } from '@/components/moderation/flag-dialog'

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia
})

describe('FlagDialog', () => {
  it('submits the chosen reason and thanks the reader', async () => {
    const onSubmit = jest.fn().mockResolvedValue(null)
    render(<FlagDialog onSubmit={onSubmit} onDismiss={jest.fn()} />)
    expect(screen.getByText('Would you like to flag this content as:')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Spam' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('spam'))
    expect(await screen.findByText('Thank you.')).toBeInTheDocument()
  })

  it('shows the error and stays on the choices when the report fails', async () => {
    render(<FlagDialog onSubmit={jest.fn().mockResolvedValue('nope')} onDismiss={jest.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Violence' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nope')
  })
})
