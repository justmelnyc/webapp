import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BuyLinkDialog } from './buy-link-dialog'

describe('BuyLinkDialog', () => {
  it('enables Submit only for a valid URL and prefixes the protocol', async () => {
    const onConfirm = jest.fn()
    render(<BuyLinkDialog text="" onConfirm={onConfirm} onDismiss={jest.fn()} />)
    const submit = screen.getByRole('button', { name: 'Submit' })
    expect(submit).toBeDisabled()
    await userEvent.type(screen.getByPlaceholderText('Product detail URL'), 'shop.example.com/a')
    expect(submit).toBeEnabled()
    await userEvent.click(submit)
    expect(onConfirm).toHaveBeenCalledWith('http://shop.example.com/a')
  })

  it('offers Update and Remove for an existing link', async () => {
    const onConfirm = jest.fn()
    render(<BuyLinkDialog text="https://shop.example.com/a" onConfirm={onConfirm} onDismiss={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onConfirm).toHaveBeenCalledWith(null)
  })
})
