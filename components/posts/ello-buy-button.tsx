import { MoneyIcon } from '@/components/icons'
import './ello-buy-button.css'

/** The original's ElloBuyButton: the green money badge linking to a region's buy URL. */
export const ElloBuyButton = ({ to }: { to: string }) => (
  <a className="ElloBuyButton" href={to} rel="noopener noreferrer" target="_blank">
    <MoneyIcon />
  </a>
)

/** The original's `buyLinkURL && buyLinkURL.length` test. */
export const hasBuyLink = (url: string | null | undefined): url is string => !!url && url.length > 0
