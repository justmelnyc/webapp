import { EditorialGrid } from '@/components/editorials/editorial-grid'
import { Hero } from '@/components/layout/hero'
import { getEditorials, getPageHeader } from '@/services/content'

const HomePage = async () => {
  const [header, editorials] = await Promise.all([getPageHeader('EDITORIAL'), getEditorials()])
  return (
    <div className="flex flex-col gap-5">
      {header && <Hero header={header} />}
      <EditorialGrid editorials={editorials} />
    </div>
  )
}

export default HomePage
