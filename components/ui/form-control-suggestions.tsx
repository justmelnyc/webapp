import { cn } from '@/utils/cn'
import styles from './form-control-suggestions.module.css'

interface SuggestionsProps {
  suggestions: string[]
  onPick: (suggestion: string) => void
}

/** The original's UsernameControl `renderSuggestions`: an empty collapsed list, or the free usernames to pick. */
export const Suggestions = ({ suggestions, onPick }: SuggestionsProps) => {
  if (suggestions.length === 0) {
    return (
      <p className={cn('FormControlSuggestionList', styles.suggestionList)}>
        <span />
      </p>
    )
  }
  return (
    <ul className={cn('FormControlSuggestionList hasSuggestions', styles.suggestionList, styles.hasSuggestions)}>
      <p className={styles.suggestionIntro}>Here are some available usernames &mdash;</p>
      {suggestions.map((suggestion) => (
        <li key={suggestion}>
          <button
            type="button"
            className={cn('FormControlSuggestionButton', styles.suggestionButton)}
            title={suggestion}
            onClick={() => onPick(suggestion)}
          >
            {suggestion}
          </button>
        </li>
      ))}
    </ul>
  )
}
