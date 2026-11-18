/**
 * The values a preference toggle changes. Like the original's `preferenceToggleChanged`, making the profile
 * private also turns off reposting and sharing.
 */
export const preferencePatch = (key: string, value: boolean): Record<string, boolean> =>
  key === 'is_public' && !value
    ? { is_public: false, has_reposting_enabled: false, has_sharing_enabled: false }
    : { [key]: value }
