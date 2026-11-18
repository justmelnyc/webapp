import Immutable from 'immutable'

// Drop the temporary (pre-upload) preview from a user's avatar and cover image.
// avatar/coverImage are null when a user has no image, and Immutable's deleteIn
// throws "invalid keyPath" on a non-collection, so only touch real Maps.
export default function removeTmpImages(user) {
  return ['avatar', 'coverImage'].reduce((result, key) => (
    Immutable.Map.isMap(result.get(key)) ? result.deleteIn([key, 'tmp']) : result
  ), user)
}
