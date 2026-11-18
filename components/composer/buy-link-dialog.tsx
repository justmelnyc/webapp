'use client'

import { useState } from 'react'
import { FormControl } from '@/components/ui/form-control'
import { Modal, ModalDialog } from '@/components/ui/modal'
import { isValidBuyUrl, withProtocol } from '@/utils/buy-link'
import { cn } from '@/utils/cn'
import styles from './buy-link-dialog.module.css'

interface BuyLinkDialogProps {
  /** The post's current buy link; a non-empty one switches the dialog to Update / Remove. */
  text: string
  /** `null` removes the link. */
  onConfirm: (url: string | null) => void
  onDismiss: () => void
}

/** The original's BuyLinkDialog ("Sell your work"): one URL field, validated as you type. */
export const BuyLinkDialog = ({ text, onConfirm, onDismiss }: BuyLinkDialogProps) => {
  const [value, setValue] = useState(text)
  const valid = isValidBuyUrl(value)
  const hasLink = text.length > 0

  return (
    <Modal label="Sell your work" onDismiss={onDismiss}>
      <ModalDialog className={styles.dialog}>
        <h2 className={styles.heading}>Sell your work</h2>
        <FormControl
          appearance="box"
          status={valid ? 'success' : 'indeterminate'}
          initialValue={text}
          className={styles.control}
        >
          <FormControl.Input
            id="buyLink"
            name="buy[productDetail]"
            type="text"
            autoFocus
            placeholder="Product detail URL"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <FormControl.Status />
        </FormControl>
        <button
          type="button"
          className={cn(styles.button, styles.submit)}
          disabled={!valid}
          onClick={() => onConfirm(withProtocol(value))}
        >
          {hasLink ? 'Update' : 'Submit'}
        </button>
        {hasLink ? (
          <button
            type="button"
            className={cn(styles.button, styles.remove)}
            onClick={() => onConfirm(null)}
          >
            Remove
          </button>
        ) : null}
        <button type="button" className={styles.button} onClick={onDismiss}>
          Cancel
        </button>
      </ModalDialog>
    </Modal>
  )
}
