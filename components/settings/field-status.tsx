import type { ControlStatus } from '@/components/ui/form-control'

/** The status icon a control shows once it has a value: a check, or a cross when invalid. */
export const outcome = (hasValue: boolean, error: string | undefined): ControlStatus => {
  if (!hasValue) return 'indeterminate'
  return error ? 'failure' : 'success'
}

/** The original's `renderStatus`: the message under a failing control. */
export const FieldError = ({ message }: { message: string | undefined }) =>
  message ? <p role="alert">{message}</p> : null
