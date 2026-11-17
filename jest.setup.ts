import '@testing-library/jest-dom'

// Server Action modules import Next's server runtime, which jsdom can't load. Components
// that merely contain a button wired to one (e.g. PostOwnerMenu) don't need the real thing.
jest.mock('@/actions/composer-actions', () => ({
  createPost: jest.fn(),
  deletePost: jest.fn(),
}))
