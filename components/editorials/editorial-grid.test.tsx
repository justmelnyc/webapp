import { render, screen } from '@testing-library/react'
import { editorialSchema, type Editorial } from '@/types/content'
import { EditorialGrid } from './editorial-grid'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))

const editorial = (n: number): Editorial =>
  editorialSchema.parse({ id: `e${n}`, kind: 'EXTERNAL', title: `Editorial ${n}`, subtitle: 'Sub', url: 'https://example.com' })

describe('EditorialGrid', () => {
  it('renders each editorial as a titled link tile', () => {
    render(<EditorialGrid editorials={[1, 2, 3].map(editorial)} />)
    expect(screen.getByRole('heading', { name: 'Editorial 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editorial 3' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'https://example.com' })).toHaveLength(3)
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<EditorialGrid editorials={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
