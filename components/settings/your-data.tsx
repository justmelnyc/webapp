import { ExportDataButton } from '@/components/settings/export-data-button'
import { TreeSection } from '@/components/settings/tree-section'
import { cn } from '@/utils/cn'
import panelStyles from './settings-panels.module.css'
import treeStyles from './settings-tree.module.css'

interface YourDataProps {
  username: string
  name: string | null | undefined
  bio: string | null | undefined
  links: Array<{ url: string; text?: string | null }>
  avatarUrl: string | null | undefined
  coverUrl: string | null | undefined
}

const Dash = () => <span>&mdash;</span>

const OriginalLink = ({ url }: { url: string | null | undefined }) =>
  url ? (
    <a href={url} rel="noopener noreferrer" target="_blank">
      View original image
    </a>
  ) : (
    <Dash />
  )

/** The original's "Your Data" panel. */
export const YourData = ({ username, name, bio, links, avatarUrl, coverUrl }: YourDataProps) => (
  <TreeSection title="Your Data">
    <p className={cn('SettingsDataDescription', treeStyles.dataDescription)}>
      The only data that Ello stores about you is what you enter on your settings page and what you post. All other
      usage data that we collect is anonymized, and you can opt out.
    </p>
    <dl className={cn('SettingsDefinitionValues', treeStyles.dataValues)}>
      <dt>Username:</dt>
      <dd>{`@${username}`}</dd>
      <dt>Name:</dt>
      <dd>{name || <Dash />}</dd>
      <dt>Short Bio:</dt>
      <dd>{bio || <Dash />}</dd>
      <dt>Links:</dt>
      <dd>
        {links.length > 0 ? (
          links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{ marginRight: '0.3125rem' }}>
              {link.text || link.url}
            </a>
          ))
        ) : (
          <Dash />
        )}
      </dd>
      <dt>Avatar:</dt>
      <dd>
        <OriginalLink url={avatarUrl} />
      </dd>
      <dt>Header:</dt>
      <dd>
        <OriginalLink url={coverUrl} />
      </dd>
    </dl>
    <div className={cn('SettingsCell', panelStyles.cell)}>
      <dl className={cn('SettingsDefinition', panelStyles.definition)}>
        <dt>Export Data</dt>
        <dd>
          This includes all of the content you have posted on Ello. We will email you a link to download your data.
        </dd>
      </dl>
      <ExportDataButton />
    </div>
  </TreeSection>
)
