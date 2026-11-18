import { cn } from '@/utils/cn'

interface PostPaginatorProps {
  isBusy: boolean
  onLoadMore: () => void
}

/** The original's gray 'Load More' pill; shows the gradient loading bar while a page loads. */
export const PostPaginator = ({ isBusy, onLoadMore }: PostPaginatorProps) => (
  <div className={cn('Paginator isCentered', isBusy && 'isBusy')}>
    <button type="button" className="PaginatorButton" onClick={onLoadMore} disabled={isBusy}>
      <span>Load More</span>
    </button>
  </div>
)
