/**
 * Hashtags in post text are `<span class="hashtag-link" data-href="/search?terms=%23tag">` (the API
 * sends spans, not anchors). Returns the in-app path a click on `target` should open, or null.
 */
export const hashtagPath = (target: EventTarget | null): string | null => {
  if (!(target instanceof Element)) return null
  const href = target.closest('.hashtag-link')?.getAttribute('data-href')
  return href && href.startsWith('/') && !href.startsWith('//') ? href : null
}
