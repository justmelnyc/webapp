import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from './field'

describe('Field', () => {
  it('associates the label with the input', async () => {
    render(
      <Field>
        <Field.Label htmlFor="email">Email</Field.Label>
        <Field.Input id="email" />
      </Field>,
    )
    const input = screen.getByLabelText('Email')
    await userEvent.type(input, 'a@b.co')
    expect(input).toHaveValue('a@b.co')
  })

  it('renders an alert only when there is an error', () => {
    const { rerender } = render(
      <Field>
        <Field.Error>{undefined}</Field.Error>
      </Field>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    rerender(
      <Field>
        <Field.Error>Required</Field.Error>
      </Field>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('passes aria-invalid through to inputs and textareas', () => {
    render(
      <Field>
        <Field.Input aria-label="one" aria-invalid />
        <Field.Textarea aria-label="two" aria-invalid={false} />
      </Field>,
    )
    expect(screen.getByLabelText('one')).toBeInvalid()
    expect(screen.getByLabelText('two')).toBeValid()
  })

  it('merges className and forwards input props', () => {
    render(<Field.Input aria-label="pw" type="password" className="extra" placeholder="secret" />)
    const input = screen.getByLabelText('pw')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('placeholder', 'secret')
    expect(input).toHaveClass('extra', 'w-full')
  })
})
