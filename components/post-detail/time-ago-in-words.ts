/**
 * The post page and its comments word ages exactly like the streams do. The original's
 * `Date#timeAgoInWords` has an "about" prefix (`~3h`), but its main.js switches that off for the whole
 * app (`updateTimeAgoStrings({ about: '' })`), so there is one wording: `3h`, `1mth`, `1y`.
 */
export { timeAgoInWords } from '@/components/posts/time-ago-in-words'
