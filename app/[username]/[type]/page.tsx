import { redirect } from 'next/navigation'

/** Original: an unrecognized `/:username/:type` goes back to `/username`. (followers, following, loves are siblings.) */
const UnknownProfileTypePage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  redirect(`/${decodeURIComponent(username).toLowerCase()}`)
}

export default UnknownProfileTypePage
