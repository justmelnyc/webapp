'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { savePreference } from '@/actions/profile-actions'
import { AdultPostsDialog } from '@/components/settings/adult-posts-dialog'
import { Preference } from '@/components/settings/preference'
import { TreeSection } from '@/components/settings/tree-section'
import { preferencePatch } from '@/lib/preferences'
import type { Preferences } from '@/services/settings'
import { toast } from '@/stores/toast-store'

interface PreferenceTogglesProps {
  preferences: Preferences
}

type Values = Record<string, boolean>

const RULES_LINK = (
  <a href="/wtf/post/rules" target="_blank">
    What does this mean?
  </a>
)

const NSFW_DISCLAIMER =
  'Note: Apple iOS rules block the sharing of NSFW content through iOS apps. Accounts & posts marked NSFW will not appear in search results on the Ello iOS App but will appear when using Ello on the web. If you want your posts to appear on Ello iOS, please set "Post Adult Content" to "No".'

/**
 * The preference sections: the ones the API serves (Privacy, Content) followed by the original's hard-coded NSFW
 * section. Toggles save as they change.
 */
export const PreferenceToggles = ({ preferences }: PreferenceTogglesProps) => {
  const { sections, adult } = preferences
  const initial: Values = {
    ...Object.fromEntries(sections.flatMap((s) => s.items.map((i) => [i.key, i.value]))),
    views_adult_content: adult.viewsAdultContent,
    posts_adult_content: adult.postsAdultContent,
  }
  const [values, setOptimistic] = useOptimistic<Values, Values>(initial, (state, patch) => ({ ...state, ...patch }))
  const [, startTransition] = useTransition()
  const [showAdultDialog, setShowAdultDialog] = useState(false)

  const toggle = (key: string, value: boolean): void => {
    if (key === 'posts_adult_content' && value) setShowAdultDialog(true)
    startTransition(async () => {
      const patch = preferencePatch(key, value)
      setOptimistic(patch)
      const result = await savePreference(key, value)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <>
      {sections.map((section) => (
        <TreeSection key={section.label} title={section.label}>
          {section.items.map((item) => (
            <Preference
              key={item.key}
              id={item.key}
              term={item.label}
              checked={values[item.key] ?? false}
              // The original disables sharing while the profile is private.
              disabled={item.key === 'has_sharing_enabled' && values.is_public === false}
              onChange={(next) => toggle(item.key, next)}
            >
              {item.info}
            </Preference>
          ))}
        </TreeSection>
      ))}
      <TreeSection title="NSFW">
        <Preference
          id="viewsAdultContent"
          term="View Adult Content"
          checked={values.views_adult_content ?? false}
          onChange={(next) => toggle('views_adult_content', next)}
        >
          {RULES_LINK}
        </Preference>
        <Preference
          id="postsAdultContent"
          term="Post Adult Content"
          checked={values.posts_adult_content ?? false}
          onChange={(next) => toggle('posts_adult_content', next)}
        >
          {RULES_LINK}
        </Preference>
        <p>
          <em>{NSFW_DISCLAIMER}</em>
        </p>
      </TreeSection>
      {showAdultDialog ? <AdultPostsDialog onDismiss={() => setShowAdultDialog(false)} /> : null}
    </>
  )
}
