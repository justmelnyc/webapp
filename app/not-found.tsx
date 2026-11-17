import Link from 'next/link'

const NotFound = () => (
  <div className="py-24 text-center">
    <h1 className="text-5xl font-light">Not found</h1>
    <p className="text-slate mt-3">That page doesn’t exist, or it’s been removed.</p>
    <Link href="/" className="mt-6 inline-block underline">
      Back home
    </Link>
  </div>
)

export default NotFound
