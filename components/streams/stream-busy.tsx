import { ElloMark } from '@/components/icons'
import { cn } from '@/utils/cn'
import './stream.css'

/** The original's `StreamContainer.renderLoading()`: the spinning mark where the stream will be. */
export const StreamBusy = ({ className }: { className?: string }) => (
  <section className={cn('StreamContainer isBusy', className)}>
    <div className="StreamBusyIndicator">
      <ElloMark className="isSpinner" />
    </div>
  </section>
)
