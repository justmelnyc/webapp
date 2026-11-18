import type { ReactNode, SVGProps } from 'react'
import './icons.css'
import './icons-editor.css'
import './icons-navbar.css'
import './icons-posts.css'

export const cx = (...names: Array<string | null | undefined | false>): string => names.filter(Boolean).join(' ')

export interface ClassNameProps {
  className?: string
}

export const SVGComponent = ({ children, ...rest }: SVGProps<SVGSVGElement>) => <svg {...rest}>{children}</svg>

interface SVGIconProps {
  children: ReactNode
  className: string
  onClick?: () => void
}

export const SVGIcon = ({ children, className, onClick }: SVGIconProps) => (
  <SVGComponent className={cx(className, 'SVGIcon')} onClick={onClick} width="20" height="20">
    {children}
  </SVGComponent>
)

interface SVGBoxProps {
  children: ReactNode
  className: string
  height?: string | null
  size?: string
  width?: string | null
}

export const SVGBox = ({ children, className, height = null, size = '40', width = null }: SVGBoxProps) => (
  <SVGComponent className={cx(className, 'SVGBox')} width={width || size} height={height || size}>
    {children}
  </SVGComponent>
)

// Shapes for building icons

export const FillShapeForty = ({ className = 'svg-fill' }: ClassNameProps) => (
  <path className={className} d="M0 0h40v40h-40z" />
)

export const FillShapeSixty = ({ className = 'svg-fill' }: ClassNameProps) => (
  <path className={className} d="M0 0h60v60h-60z" />
)

export const SmileShapeForty = () => (
  <path
    className="SmileShape"
    d="M20.5 32c-5.5 0-10.2-3.7-11.6-9-.2-.6.2-1.2.8-1.4.6-.2 1.2.2 1.4.8 1.1 4.3 5 7.3 9.4 7.3s8.3-3 9.4-7.3c.2-.6.8-1 1.4-.8.6.2 1 .8.8 1.4-1.3 5.3-6.1 9-11.6 9z"
  />
)

export const BadgeShape = () => (
  <g className="BadgeShape svg-fill-stroke svg-stroke-round">
    <polygon points="12,1 14.2,3.8 17.5,2.5 18,6 21.5,6.5 20.2,9.8 23,12 20.2,14.2 21.5,17.5 18,18 17.5,21.5 14.2,20.2 12,23 9.8,20.2 6.5,21.5 6,18 2.5,17.5 3.8,14.2 1,12 3.8,9.8 2.5,6.5 6,6 6.5,2.5 9.8,3.8" />
  </g>
)

export const CheckShape = () => (
  <g className="CheckShape svg-stroke svg-stroke-bevel">
    <polyline points="8,11.9 11.3,16 16,8" />
  </g>
)
