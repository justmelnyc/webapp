import nextJest from 'next/jest.js'
import type { Config } from 'jest'

const createJestConfig = nextJest({ dir: './' })

// sanitize-html pulls in ESM-only dependencies that must be transpiled for Jest's CommonJS runtime
const ESM_PACKAGES = ['htmlparser2', 'entities', 'domhandler', 'domutils', 'domelementtype', 'dom-serializer']

const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // server-only throws outside the react-server condition; use its no-op entry in tests
    '^server-only$': '<rootDir>/node_modules/server-only/empty.js',
  },
  testPathIgnorePatterns: ['<rootDir>/legacy/', '<rootDir>/mock/', '<rootDir>/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/legacy/'],
} satisfies Config

// next/jest overwrites transformIgnorePatterns, so patch the resolved config.
const buildConfig = async (): Promise<Config> => {
  const resolved = await createJestConfig(config)()
  return {
    ...resolved,
    transformIgnorePatterns: [
      `/node_modules/(?!(?:\\.pnpm/)?(?:${ESM_PACKAGES.join('|')})/)`,
      '^.+\\.module\\.(css|sass|scss)$',
    ],
  }
}

export default buildConfig
