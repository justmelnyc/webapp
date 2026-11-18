import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './app-shell'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const shell = (html: string) => (
  <AppShell isLoggedIn={false}>
    <div data-testid="text" dangerouslySetInnerHTML={{ __html: html }} />
  </AppShell>
)

describe('AppShell hashtag links', () => {
  beforeEach(() => push.mockClear())

  it('opens the search a hashtag span points at', async () => {
    render(shell('<p><span class="hashtag-link" data-href="/search?terms=%23film">#film</span></p>'))
    await userEvent.click(screen.getByText('#film'))
    expect(push).toHaveBeenCalledWith('/search?terms=%23film')
  })

  it('ignores clicks elsewhere and off-site hrefs', async () => {
    render(shell('<p>plain</p><span class="hashtag-link" data-href="https://evil.example">#x</span>'))
    await userEvent.click(screen.getByText('plain'))
    await userEvent.click(screen.getByText('#x'))
    expect(push).not.toHaveBeenCalled()
  })
})
