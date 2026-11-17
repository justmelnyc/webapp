import styles from './related-posts.module.css'

/**
 * The original's `RelatedPostsStreamContainer`. The related-posts endpoint is empty for the mock
 * data, so only the title and the (empty) grid columns render; CSS shows as many columns as the
 * original's `columnCount` (2 / 3 / 3 / 4 / 5 / 6 by breakpoint).
 */
export const RelatedPosts = () => (
  <section className={`StreamContainer RelatedPostsStreamContainer ${styles.related}`}>
    <div className="with-lightbox">
      <div className="Posts asGrid">
        <h2 className={styles.relatedTitle}>Related Posts</h2>
        {[1, 2, 3, 4, 5, 6].map((column) => (
          <div key={column} className={`Column ${styles.column}`} />
        ))}
      </div>
    </div>
  </section>
)
