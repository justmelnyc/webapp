import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryOptionButton, OptionButton } from '@/components/ui/option-button'

describe('OptionButton', () => {
  it('is a plain button that passes clicks and props through', async () => {
    const onClick = jest.fn()
    render(
      <OptionButton active={false} onClick={onClick}>
        A Fan
      </OptionButton>,
    )
    const button = screen.getByRole('button', { name: 'A Fan' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).not.toHaveAttribute('aria-pressed')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire when it is the picked, disabled one', async () => {
    const onClick = jest.fn()
    render(
      <OptionButton active disabled onClick={onClick}>
        An Artist
      </OptionButton>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'An Artist' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('CategoryOptionButton', () => {
  it('says whether it is pressed', () => {
    const { rerender } = render(<CategoryOptionButton active={false}>Art</CategoryOptionButton>)
    expect(screen.getByRole('button', { name: 'Art' })).toHaveAttribute('aria-pressed', 'false')
    rerender(<CategoryOptionButton active>Art</CategoryOptionButton>)
    expect(screen.getByRole('button', { name: 'Art' })).toHaveAttribute('aria-pressed', 'true')
  })
})
