import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { TreeSection } from '@/components/settings/tree-section'
import { API_ORIGIN } from '@/lib/env'
import { cn } from '@/utils/cn'
import panelStyles from './settings-panels.module.css'

/** The original's "Account Deletion" section. */
export const AccountDeletion = () => (
  <TreeSection title="Account Deletion">
    <div className={cn('SettingsCell', panelStyles.cell)}>
      <dl className={cn('SettingsDefinition', panelStyles.definition)}>
        <dt>
          <span>Delete Account</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- the original's 20px emoji image */}
          <img
            className={cn('inline-block', panelStyles.wave)}
            src={`${API_ORIGIN}/images/emoji/wave.png`}
            alt="ello"
            title="Sad wave"
            width={20}
            height={20}
          />
        </dt>
        <dd>
          By deleting your account you remove your personal information from Ello. Your account cannot be restored.
        </dd>
      </dl>
      <DeleteAccountButton />
    </div>
  </TreeSection>
)
