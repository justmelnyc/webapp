'use client'

import { useId, useState, type ReactNode } from 'react'
import { ChevronIcon } from '@/components/icons'
import { cn } from '@/utils/cn'
import treeStyles from './settings-tree.module.css'

/** The original's `TreeButton` + `TreePanel`: a heading that expands its panel (collapsed by default). */
export const TreeSection = ({ title, children }: { title: string; children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true)
  const panelId = useId()
  return (
    <>
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-controls={panelId}
        onClick={() => setCollapsed((value) => !value)}
        className={cn('TreeButton', treeStyles.treeButton, collapsed && ['isCollapsed', treeStyles.collapsed])}
      >
        <ChevronIcon />
        {title}
      </button>
      <div id={panelId} inert={collapsed} className={cn('TreePanel', treeStyles.treePanel, collapsed && treeStyles.panelCollapsed)}>
        {children}
      </div>
    </>
  )
}
