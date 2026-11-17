import { ErrorState4xx, ErrorView } from '@/components/post-detail/error-state'

const NotFound = () => (
  <ErrorView>
    <ErrorState4xx />
  </ErrorView>
)

export default NotFound
