/**
 * Related posts under a post (`PostDetail.js`, `postsAsRelated`). The original asks for one row:
 * `per_page` is the viewport's column count, less one from three columns up (the comments take
 * that room), and the grid has that many columns less one from four up.
 */
export const relatedPostsPerPage = (columnCount: number): number => (columnCount > 2 ? columnCount - 1 : columnCount)

export const relatedColumnCount = (columnCount: number): number => (columnCount > 3 ? columnCount - 1 : columnCount)

/** The most the original ever asks for (seven columns from 152.5em). The page loads these and shows a row of them. */
export const RELATED_POSTS_MAX = 6
