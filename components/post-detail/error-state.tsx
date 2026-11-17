import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './error-state.module.css'
import detailStyles from './post-detail.module.css'

const STATUS_URL = 'http://status.ello.co/'
const STORE_URL = 'http://ello.threadless.com/'
const DIRECTORY_PATH = '/wtf/post/communitydirectory'

const ErrorStateImage = () => (
  // eslint-disable-next-line @next/next/no-img-element -- a fixed 130px animated gif from /public
  <img className={styles.image} src="/static/images/support/ello-spin.gif" alt="Ello" width={130} height={130} />
)

const Links = () => (
  <>
    <p>
      There might be more information on our <a href={STATUS_URL}>status page</a>.
    </p>
    <p>
      If all else fails you can try checking out our{' '}
      <a href={STORE_URL} target="_blank" rel="noopener noreferrer">
        Store
      </a>{' '}
      or the <a href={DIRECTORY_PATH}>Community Directory</a>.
    </p>
  </>
)

/** The original's `ErrorState4xx`. */
export const ErrorState4xx = () => (
  <div className={styles.error}>
    <ErrorStateImage />
    <p>
      This doesn&rsquo;t happen often, but it looks like something is broken. Hitting the back button and trying
      again might be your best bet. If that doesn&rsquo;t work you can <Link href="/">head back to the homepage.</Link>
    </p>
    <Links />
  </div>
)

/** The original's `ErrorState5xx`. */
export const ErrorState5xx = () => (
  <div className={styles.error}>
    <ErrorStateImage />
    <p>
      It looks like something is broken and we couldn&rsquo;t complete your request. Please try again in a few
      minutes. If that doesn&rsquo;t work you can <Link href="/">head back to the homepage.</Link>
    </p>
    <Links />
  </div>
)

/** The original's `PostDetailError`: the error sits in the post detail view under the navbar spacer. */
export const ErrorView = ({ children }: { children: ReactNode }) => (
  <>
    <div className={cn('Hero', detailStyles.spacer)} />
    <div className={cn('PostDetail', detailStyles.root)}>
      <section className={cn('StreamContainer isError', styles.stream)}>{children}</section>
    </div>
  </>
)
