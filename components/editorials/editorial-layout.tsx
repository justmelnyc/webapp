import type { ReactNode } from 'react'
import type { Editorial } from '@/types/content'
import { cn } from '@/utils/cn'
import { EditorialTile, type EditorialSize } from './editorial-tile'

/* Port of EditorialLayout.js. Rows are flex rows from 60em; below that, every cell is 100vw tall. */

const Row = ({ children }: { children: ReactNode }) => (
  <div className="w-full bp3:mb-20 bp3:flex bp3:flex-wrap bp4:mb-40">{children}</div>
)

const Cell = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <div className={cn('flex h-[100vw] w-full flex-wrap overflow-hidden pb-10 bp3:pb-0', className)}>{children}</div>
)

const height1 = 'bp3:h-[420px]'
const height2 = 'bp3:h-[840px]'
const halfHeight = 'bp3:h-[calc(50%-10px)] bp4:h-[calc(50%-20px)]'
const width1 = 'bp3:w-1/3'
const width2 = 'bp3:flex-1'
const halfWidth = 'bp3:flex-[2]'
const pushRight = 'bp3:pr-20 bp4:pr-40'
const alignEnd = 'bp3:self-end'

interface LayoutProps {
  /** Up to 24 editorials; positions follow the original's row rhythm. */
  editorials: Editorial[]
  signedIn: boolean
}

export const EditorialLayout = ({ editorials, signedIn }: LayoutProps) => {
  const tile = (index: number, size: EditorialSize): ReactNode => {
    const editorial = editorials[index]
    return editorial ? <EditorialTile editorial={editorial} size={size} signedIn={signedIn} /> : null
  }
  const has = (index: number): boolean => index < editorials.length

  return (
    <section className="mx-auto flex max-w-site flex-wrap">
      {has(0) && (
        <Row>
          <Cell className={cn(width2, height1, pushRight)}>{tile(0, '2x1')}</Cell>
          <Cell className={cn(width1, height1)}>{tile(1, '1x1')}</Cell>
        </Row>
      )}
      {has(2) && (
        <Row>
          <Cell className={cn(width1, height1, pushRight)}>{tile(2, '1x1')}</Cell>
          <Cell className={cn(width1, height1, pushRight)}>{tile(3, '1x1')}</Cell>
          <Cell className={cn(width1, height1)}>{tile(4, '1x1')}</Cell>
        </Row>
      )}
      {has(5) && (
        <Row>
          <Cell className={cn(width2, height2, pushRight)}>{tile(5, '2x2')}</Cell>
          {has(6) && (
            <Cell className={cn(width1, height2)}>
              <Cell className={halfHeight}>{tile(6, '1x2')}</Cell>
              <Cell className={cn(halfHeight, alignEnd)}>{tile(7, '1x1')}</Cell>
            </Cell>
          )}
        </Row>
      )}
      {has(8) && (
        <Row>
          <Cell className={cn(width1, height2, pushRight)}>{tile(8, '1x2')}</Cell>
          {has(9) && (
            <Cell className={cn(width2, height2)}>
              <Cell className={halfHeight}>{tile(9, '2x1')}</Cell>
              <Cell className={cn(halfWidth, halfHeight, pushRight, alignEnd)}>{tile(10, '1x1')}</Cell>
              <Cell className={cn(halfWidth, halfHeight, alignEnd)}>{tile(11, '1x1')}</Cell>
            </Cell>
          )}
        </Row>
      )}
      {has(12) && (
        <Row>
          <Cell className={cn(width1, height1, pushRight)}>{tile(12, '1x1')}</Cell>
          <Cell className={cn(width2, height1)}>{tile(13, '2x1')}</Cell>
        </Row>
      )}
      {has(14) && (
        <Row>
          <Cell className={cn(width1, height1, pushRight)}>{tile(14, '1x1')}</Cell>
          <Cell className={cn(width1, height1, pushRight)}>{tile(15, '1x1')}</Cell>
          <Cell className={cn(width1, height1)}>{tile(16, '1x1')}</Cell>
        </Row>
      )}
      {has(17) && (
        <Row>
          <Cell className={cn(width1, height2, pushRight)}>
            <Cell className={halfHeight}>{tile(17, '1x1')}</Cell>
            <Cell className={cn(halfHeight, alignEnd)}>{tile(18, '1x1')}</Cell>
          </Cell>
          <Cell className={cn(width2, height2)}>{tile(19, '2x2')}</Cell>
        </Row>
      )}
      {has(20) && (
        <Row>
          <Cell className={cn(width2, height2, pushRight)}>
            <Cell className={halfHeight}>{tile(20, '2x1')}</Cell>
            <Cell className={cn(halfWidth, halfHeight, pushRight, alignEnd)}>{tile(21, '1x1')}</Cell>
            <Cell className={cn(halfWidth, halfHeight, alignEnd)}>{tile(22, '1x1')}</Cell>
          </Cell>
          <Cell className={cn(width1, height2)}>{tile(23, '1x2')}</Cell>
        </Row>
      )}
    </section>
  )
}
