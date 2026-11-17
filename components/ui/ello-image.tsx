import Image from 'next/image'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof Image>, 'unoptimized' | 'alt'> & { alt?: string }

/**
 * Images are already sized by the API (and served from the mock or a CDN),
 * so skip Next's optimizer, which refuses localhost origins.
 */
export const ElloImage = ({ alt = '', ...props }: Props) => <Image unoptimized alt={alt} {...props} />
