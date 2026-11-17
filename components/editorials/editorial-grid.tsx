import type { Editorial } from '@/types/content'
import { EditorialLayout } from './editorial-layout'

const PAGE_SIZE = 24

/** The home page's editorial modules, chunked into pages of 24 like the original's `editorials()`. */
export const EditorialGrid = ({ editorials, signedIn = false }: { editorials: Editorial[]; signedIn?: boolean }) => {
  const pages: Editorial[][] = []
  for (let start = 0; start < editorials.length; start += PAGE_SIZE) {
    pages.push(editorials.slice(start, start + PAGE_SIZE))
  }
  return (
    <>
      {pages.map((page) => (
        <EditorialLayout key={page[0]?.id} editorials={page} signedIn={signedIn} />
      ))}
    </>
  )
}
