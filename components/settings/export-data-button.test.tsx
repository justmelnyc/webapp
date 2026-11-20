import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { requestDataExport } from '@/actions/account-actions'
import { useToastStore } from '@/stores/toast-store'
import { ExportDataButton } from './export-data-button'

jest.mock('@/actions/account-actions', () => ({ requestDataExport: jest.fn() }))

const exportMock = jest.mocked(requestDataExport)

describe('ExportDataButton', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reads "Exported" while the export is made, then links to the download', async () => {
    const user = userEvent.setup()
    let finish: (url: string) => void = () => undefined
    exportMock.mockReturnValue(new Promise((resolve) => { finish = (url) => resolve({ ok: true, data: { url } }) }))
    render(<ExportDataButton />)

    await user.click(screen.getByRole('button', { name: 'Request Export' }))
    expect(screen.getByRole('button', { name: 'Exported' })).toBeDisabled()

    finish('http://localhost:7770/exports/ello-export-ada.json')
    const link = await screen.findByRole('link', { name: 'Download Export' })
    expect(link).toHaveAttribute('href', 'http://localhost:7770/exports/ello-export-ada.json')
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('never links to an address that is not http(s)', async () => {
    const user = userEvent.setup()
    exportMock.mockResolvedValue({ ok: true, data: { url: 'javascript:alert(1)' } })
    render(<ExportDataButton />)
    await user.click(screen.getByRole('button', { name: 'Request Export' }))
    expect(await screen.findByRole('button', { name: 'Exported' })).toBeDisabled()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('offers the request again when it failed', async () => {
    const user = userEvent.setup()
    exportMock.mockResolvedValue({ ok: false, error: 'nope' })
    render(<ExportDataButton />)
    await user.click(screen.getByRole('button', { name: 'Request Export' }))
    expect(await screen.findByRole('button', { name: 'Request Export' })).toBeEnabled()
    expect(useToastStore.getState().toasts.some((toast) => toast.message === 'nope')).toBe(true)
  })
})
