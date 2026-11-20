import { render, screen } from '@testing-library/react'
import { ZeroSubscribedStream } from './zero-subscribed-stream'

describe('ZeroSubscribedStream', () => {
  it('says the subscribed categories have no posts and links to all categories', () => {
    render(<ZeroSubscribedStream />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Category posts you subscribe to live here. You aren’t subscribed to any categories, go choose some.',
    )
    expect(screen.getByRole('link', { name: 'go choose some' })).toHaveAttribute('href', '/discover/all')
  })
})
