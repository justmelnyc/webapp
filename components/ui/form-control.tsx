'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { CheckIconLG, CircleIconLG, XIconLG } from '@/components/icons'
import { cn } from '@/utils/cn'
import styles from './form-control.module.css'
import { Suggestions } from './form-control-suggestions'

/*
 * The original's FormControl as composable parts:
 *   <FormControl appearance="box" status="failure">
 *     <FormControl.Label htmlFor="x">Label</FormControl.Label>
 *     <FormControl.Input id="x" {...register('x')} />
 *     <FormControl.Status />
 *     <FormControl.Message visible>Text</FormControl.Message>
 *   </FormControl>
 * It tracks hasFocus / hasValue / isInitialValue like the original (including its 250ms value poll,
 * which also catches browser autofill and programmatic resets).
 */
export type ControlStatus = 'indeterminate' | 'request' | 'failure' | 'success'
type Appearance = 'line' | 'box' | 'box-grey'

interface ControlState {
  appearance: Appearance
  status: ControlStatus
  syncValue: (value: string) => void
  setFocus: (hasFocus: boolean) => void
  initialValue: string
}

const ControlContext = createContext<ControlState | null>(null)

const useControl = (): ControlState => {
  const value = useContext(ControlContext)
  if (!value) throw new Error('FormControl parts must be rendered inside <FormControl>')
  return value
}

const STATUS_CLASS: Record<ControlStatus, string> = {
  indeterminate: 'isIndeterminate',
  request: 'isValidating',
  failure: 'isFailing',
  success: 'isSucceeding',
}

interface RootProps extends ComponentProps<'div'> {
  appearance?: Appearance
  status?: ControlStatus
  /** Hide the status icon while the value is untouched (the original's `.SettingsInfoForm .isInitialValue`). */
  hideInitialStatus?: boolean
  initialValue?: string
}

const Root = ({
  appearance = 'line',
  status = 'indeterminate',
  hideInitialStatus = false,
  initialValue = '',
  className,
  children,
  ...props
}: RootProps) => {
  const [hasFocus, setHasFocus] = useState(false)
  const [value, setValue] = useState(initialValue)
  const hasValue = value.length > 0
  const isInitial = value === initialValue
  const state: ControlState = { appearance, status, syncValue: setValue, setFocus: setHasFocus, initialValue }
  return (
    <ControlContext value={state}>
      <div
        className={cn(
          'FormControl',
          appearance !== 'line' && 'isBoxControl',
          STATUS_CLASS[status],
          hasFocus && 'hasFocus',
          hasValue && 'hasValue',
          isInitial && 'isInitialValue',
          styles.control,
          appearance !== 'line' && styles.box,
          appearance === 'box-grey' && styles.grey,
          status === 'failure' && styles.failing,
          hasFocus && styles.hasFocus,
          hasValue && styles.hasValue,
          isInitial && styles.initial,
          hideInitialStatus && styles.initialHidden,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ControlContext>
  )
}

const Label = ({ className, ...props }: ComponentProps<'label'>) => {
  const { appearance } = useControl()
  return (
    <label
      className={cn('FormControlLabel', appearance !== 'line' && 'isBoxControl', styles.label, className)}
      {...props}
    />
  )
}

const mergeRefs = <T,>(...refs: Array<Ref<T> | undefined>) => (node: T | null): void => {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }
}

interface InputProps extends ComponentProps<'input'> {
  ref?: Ref<HTMLInputElement>
}

const Input = ({ className, ref, onChange, onFocus, onBlur, ...props }: InputProps) => {
  const control = useControl()
  const local = useRef<HTMLInputElement | null>(null)
  const { syncValue } = control

  useEffect(() => {
    // The original polls every 250ms so autofill and programmatic changes are noticed.
    const check = (): void => {
      if (local.current) syncValue(local.current.value)
    }
    check()
    const timer = setInterval(check, 250)
    return () => clearInterval(timer)
  }, [syncValue])

  return (
    <input
      ref={mergeRefs(ref, local)}
      autoCapitalize="off"
      autoCorrect="off"
      className={cn('FormControlInput', control.appearance !== 'line' && 'isBoxControl', styles.input, className)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        syncValue(e.target.value)
        onChange?.(e)
      }}
      onFocus={(e: FocusEvent<HTMLInputElement>) => {
        control.setFocus(true)
        onFocus?.(e)
      }}
      onBlur={(e: FocusEvent<HTMLInputElement>) => {
        control.setFocus(false)
        onBlur?.(e)
      }}
      {...props}
    />
  )
}

interface TextareaProps extends ComponentProps<'textarea'> {
  ref?: Ref<HTMLTextAreaElement>
}

const Textarea = ({ className, ref, onChange, onFocus, onBlur, ...props }: TextareaProps) => {
  const control = useControl()
  const local = useRef<HTMLTextAreaElement | null>(null)
  const { syncValue } = control

  useEffect(() => {
    const check = (): void => {
      if (local.current) syncValue(local.current.value)
    }
    check()
    const timer = setInterval(check, 250)
    return () => clearInterval(timer)
  }, [syncValue])

  const isBox = control.appearance !== 'line'
  return (
    <textarea
      ref={mergeRefs(ref, local)}
      autoCapitalize="off"
      autoCorrect="off"
      className={cn('FormControlInput', isBox && 'isBoxControl', styles.input, isBox && styles.boxInput, className)}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
        syncValue(e.target.value)
        onChange?.(e)
      }}
      onFocus={(e: FocusEvent<HTMLTextAreaElement>) => {
        control.setFocus(true)
        onFocus?.(e)
      }}
      onBlur={(e: FocusEvent<HTMLTextAreaElement>) => {
        control.setFocus(false)
        onBlur?.(e)
      }}
      {...props}
    />
  )
}

/** The original's `FormIcon`: a grey icon at the left of a box control (put it before the Input). */
const Icon = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('FormIcon', styles.icon, className)}>{children}</span>
)

const STATUS_ICON: Record<ControlStatus, ReactNode> = {
  indeterminate: null,
  request: <CircleIconLG />,
  failure: <XIconLG />,
  success: <CheckIconLG />,
}

const Status = ({ className }: { className?: string }) => {
  const { appearance, status } = useControl()
  return (
    <span className={cn('FormControlStatus', appearance !== 'line' && 'isBoxControl', styles.status, className)}>
      {STATUS_ICON[status]}
    </span>
  )
}

/** The original's `HoppyStatusMessage`: collapses to nothing unless it has content. */
const Message = ({ children, className, ...props }: ComponentProps<'p'>) => (
  <p
    className={cn('HoppyStatusMessage', !!children && 'hasContent', styles.message, !!children && styles.messageVisible, className)}
    role={children ? 'alert' : undefined}
    {...props}
  >
    {children ?? <span />}
  </p>
)

export const FormControl = Object.assign(Root, { Label, Input, Textarea, Icon, Status, Message, Suggestions })
