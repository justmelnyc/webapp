import Link from 'next/link'
import { BadgeFeaturedIcon } from '@/components/icons'
import type { Post } from '@/types/post'
import styles from './category-history.module.css'

type CategoryPost = NonNullable<Post['categoryPosts']>[number]

interface RecordProps {
  categoryPost: CategoryPost
  authorUsername: string
}

/** The original's `featuredElement`: who featured the post; an unnamed curator is `@ello`. */
const FeaturedBy = ({
  categoryPost,
  submittedBy,
}: {
  categoryPost: CategoryPost
  submittedBy?: string
}) => {
  if (categoryPost.status !== 'featured') return null
  const featuredBy = categoryPost.featuredBy?.username || 'ello'
  const category = categoryPost.category
  if (featuredBy === submittedBy && category) {
    return (
      <span>
        Featured by <Link href={`/${featuredBy}`}>@{featuredBy}</Link> in&nbsp;
        <Link href={`/discover/${category.slug}`}>{category.name}</Link>.
      </span>
    )
  }
  return (
    <span>
      Featured by <Link href={`/${featuredBy}`}>@{featuredBy}</Link>.
    </span>
  )
}

/** The original's `submittedElement`: "Posted into" by the author, or "Added to" by someone else. */
const SubmittedBy = ({ categoryPost, authorUsername }: RecordProps) => {
  const submittedBy = categoryPost.submittedBy?.username
  const featuredBy = categoryPost.featuredBy?.username
  const category = categoryPost.category
  if (!category) return null
  if (submittedBy === authorUsername) {
    return (
      <span>
        Posted into&nbsp;
        <Link href={`/discover/${category.slug}`}>{category.name}</Link>.
      </span>
    )
  }
  if (submittedBy !== featuredBy) {
    return (
      <span>
        Added to&nbsp;
        <Link href={`/discover/${category.slug}`}>{category.name}</Link> by&nbsp;
        <Link href={`/${submittedBy}`}>{submittedBy}</Link>.
      </span>
    )
  }
  return null
}

/**
 * The original's `CategoryPostHistory`: under the post tools of a post page, one line per category
 * the post sits in ("Featured by @ello."). Curators' feature/unfeature buttons need actions the
 * API does not send here, so only the badge is drawn.
 */
export const CategoryHistory = ({ post, className }: { post: Post; className?: string }) => (
  <aside className={className ? `CategoryHistory ${className}` : 'CategoryHistory'}>
    {(post.categoryPosts ?? []).map((categoryPost) =>
      categoryPost.status === 'removed' ? null : (
        <p key={categoryPost.id} className={styles.record}>
          {categoryPost.status === 'featured' ? (
            <span className="featured-toggle">
              <BadgeFeaturedIcon />
            </span>
          ) : null}
          <FeaturedBy
            categoryPost={categoryPost}
            submittedBy={categoryPost.submittedBy?.username}
          />
          &nbsp;
          <SubmittedBy categoryPost={categoryPost} authorUsername={post.author.username} />
        </p>
      ),
    )}
  </aside>
)
