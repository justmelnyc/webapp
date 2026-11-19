/**
 * Whether feeds (grid and list streams) show the NSFW "View" button.
 *
 * The original never does: its GraphQL post reducer (`parsePost` in v3_reducer.js) drops
 * `contentWarning`, so the button only ever came from stale REST data. Post detail pages never
 * show it either (`contentWarning && !isPostDetail` in PostRenderables.js). Set this to `true`
 * to show the button on feeds; the code behind it (ContentWarningButton) is fully working.
 */
export const SHOW_CONTENT_WARNING_ON_FEEDS = false
