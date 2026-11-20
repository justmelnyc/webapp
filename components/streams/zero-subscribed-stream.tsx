import Link from 'next/link'
import styles from './zero-stream.module.css'

/** ZeroSubscribedStream (zeros/Zeros.js): what /discover/subscribed shows when no subscribed category has posts. */
export const ZeroSubscribedStream = () => (
  <div className={styles.zero}>
    <h2 className={styles.heading}>
      Category posts you subscribe to live here.&nbsp;<br />
      You aren&rsquo;t subscribed to any categories,&nbsp;
      <Link href="/discover/all" className={styles.link}>
        go choose some
      </Link>
      .
    </h2>
  </div>
)
