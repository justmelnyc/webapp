const HOST = /^(?:[a-z0-9¡-￿](?:[a-z0-9¡-￿-]*[a-z0-9¡-￿])?\.)+[a-z¡-￿]{2,}$/i

/** The original's `isValidURL`: the protocol is optional (`http://` is prepended) and a real host is required. */
export const isValidBuyUrl = (value: string): boolean => {
  const withProtocol = value.startsWith('http') ? value : `http://${value}`
  if (/\s/.test(withProtocol)) return false
  try {
    const url = new URL(withProtocol)
    return (url.protocol === 'http:' || url.protocol === 'https:') && HOST.test(url.hostname)
  } catch {
    return false
  }
}

/** The dialog's submit step: prefix `http://` when the value does not start with `http`. */
export const withProtocol = (value: string): string => (value.startsWith('http') ? value : `http://${value}`)

/** Empty or invalid links are dropped; valid ones get their protocol. */
export const normalizeBuyLink = (value: string | undefined): string | null =>
  value && isValidBuyUrl(value.trim()) ? withProtocol(value.trim()) : null
