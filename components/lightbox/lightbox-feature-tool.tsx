'use client'

import { usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { runCategoryPostAction } from '@/actions/category-post-actions'
import { BadgeFeaturedIcon, CurateIcon } from '@/components/icons'
import { patchStreamPosts } from '@/components/streams/stream-cache'
import { toast } from '@/stores/toast-store'
import type { Post } from '@/types/post'

type CategoryPost = NonNullable<Post['categoryPosts']>[number]

/** Port of `selectCategoryForPath`: the category slug a Discover path names. */
export const categorySlugOf = (pathname: string): string =>
  pathname.replace('/discover/', '').replace('/recent', '').replace('/shop', '').replace('/trending', '')

/** Port of `selectPostCategoryPostForPath`: the post's place in the category this page shows. */
export const categoryPostForPath = (post: Post, pathname: string): CategoryPost | undefined =>
  (post.categoryPosts ?? []).find((categoryPost) => categoryPost.category?.slug === categorySlugOf(pathname))

const StatusButton = ({ categoryPost, onFire }: { categoryPost: CategoryPost; onFire: (action: unknown) => void }) => {
  const { status, actions } = categoryPost
  if (status === 'submitted' && actions?.feature) {
    const { feature } = actions
    return (
      <button type="button" className="featured-toggle" aria-label="Feature" onClick={() => onFire(feature)}>
        <CurateIcon color="#aaaaaa" />
      </button>
    )
  }
  if (status === 'featured' && actions?.unfeature) {
    const { unfeature } = actions
    return (
      <button type="button" className="featured-toggle featured" aria-label="Unfeature" onClick={() => onFire(unfeature)}>
        <CurateIcon />
      </button>
    )
  }
  if (status !== 'featured') return null
  return (
    <span className="featured-toggle">
      <BadgeFeaturedIcon />
    </span>
  )
}

/** Fires the curator's action and writes the API's answer back into the loaded streams. */
const FeatureToggle = ({ categoryPost }: { categoryPost: CategoryPost }) => {
  const queryClient = useQueryClient()
  const fire = (action: unknown): void => {
    void runCategoryPostAction(action).then((result) => {
      if (!result.ok) return toast.error(result.error)
      const { id, status, actions, featuredByUsername } = result.data
      const patch = (current: CategoryPost): CategoryPost =>
        current.id !== id
          ? current
          : { ...current, status, actions, featuredBy: featuredByUsername ? { username: featuredByUsername } : null }
      patchStreamPosts(queryClient, (p) => (p.categoryPosts ? { ...p, categoryPosts: p.categoryPosts.map(patch) } : p))
    })
  }
  return <StatusButton categoryPost={categoryPost} onFire={fire} />
}

/**
 * The original's `FeatureCategoryPostTool` with `categoryPostActions` (the `CurateIcon` star), as a
 * stream post's header draws it: on a category page, a curator features or unfeatures the post in
 * that category. The API decides who gets `actions`; nothing is drawn for a post without them.
 */
export const CategoryFeatureTool = ({ post }: { post: Post }) => {
  const categoryPost = categoryPostForPath(post, usePathname())
  if (!categoryPost?.actions) return null
  return <FeatureToggle categoryPost={categoryPost} />
}

/** The lightbox draws the same tool among its post tools (`PostTools.js`). */
export const LightboxFeatureTool = ({ post }: { post: Post }) => {
  const categoryPost = categoryPostForPath(post, usePathname())
  if (!categoryPost?.actions) return null
  return (
    <span className="PostTool FeatureCategoryPostTool isLightBox">
      <FeatureToggle categoryPost={categoryPost} />
    </span>
  )
}
