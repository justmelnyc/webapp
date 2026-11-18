const str = (value: unknown): string => (typeof value === 'string' || typeof value === 'number' ? String(value) : '')

/** An embed region's `data` is an open record on the wire: read the fields the player needs. */
export const embedFields = (
  data: Record<string, unknown>,
): { service: string; id: string; url: string; thumbnailLargeUrl: string } => ({
  service: str(data.service),
  id: str(data.id),
  url: str(data.url),
  thumbnailLargeUrl: str(data.thumbnailLargeUrl),
})
