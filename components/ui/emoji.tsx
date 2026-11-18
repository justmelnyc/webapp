'use client'

import { createContext, useContext } from 'react'

/** Where `/images/emoji/<name>.png` lives: the original loads them from its auth domain (the API). */
const AssetOriginContext = createContext('')
export const AssetOriginProvider = AssetOriginContext.Provider

interface EmojiProps {
  name: string
  title?: string
}

/** The original's `<Emoji>`: a 20px image from the API's emoji set. */
export const Emoji = ({ name, title }: EmojiProps) => {
  const origin = useContext(AssetOriginContext)
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the original's plain 20px emoji image
    <img className="inline-block" src={`${origin}/images/emoji/${name}.png`} alt="ello" title={title ?? name} width={20} height={20} />
  )
}
