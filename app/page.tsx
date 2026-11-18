import { EditorialGrid } from '@/components/editorials/editorial-grid'
import { Hero } from '@/components/layout/hero'
import { getSession } from '@/lib/session'
import { getEditorials, getPageHeader } from '@/services/content'

/** Port of pages/EditorialPage.js: hero header, then a StreamContainer holding the editorial layout. */
const HomePage = async () => {
  const [header, editorials, session] = await Promise.all([
    getPageHeader('EDITORIAL'),
    getEditorials(),
    getSession(),
  ])
  return (
    <>
      {header && <Hero header={header} />}
      <section className="StreamContainer px-0 py-10 bp2:p-20 bp4:px-40">
        <EditorialGrid editorials={editorials} signedIn={!!session} />
      </section>
    </>
  )
}

export default HomePage
