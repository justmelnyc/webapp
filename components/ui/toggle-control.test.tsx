import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleControl } from '@/components/ui/toggle-control'

describe('ToggleControl', () => {
  it('reads No when unchecked and asks for the opposite when clicked', async () => {
    const onChange = jest.fn()
    render(<ToggleControl id="t" checked={false} onChange={onChange} />)
    const input = screen.getByRole('switch')
    expect(input).not.toBeChecked()
    expect(screen.getByText('No')).toBeInTheDocument()
    await userEvent.click(input)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('reads Yes and carries isChecked when checked', () => {
    const { container } = render(<ToggleControl id="t" checked onChange={() => undefined} />)
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(container.querySelector('label')).toHaveClass('ToggleControl', 'isChecked')
  })

  it('disables the checkbox, keeps the caller class and draws its children before the text', () => {
    const { container } = render(
      <ToggleControl id="t" checked={false} disabled className="mine" aria-labelledby="term" onChange={() => undefined}>
        <i data-testid="icon" />
      </ToggleControl>,
    )
    const input = screen.getByRole('switch')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-labelledby', 'term')
    const label = container.querySelector('label')
    expect(label).toHaveClass('mine')
    expect(label?.children[1]).toBe(screen.getByTestId('icon'))
    expect(label?.lastElementChild).toHaveTextContent('No')
  })
})
