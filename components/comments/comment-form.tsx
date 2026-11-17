'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createComment } from '@/actions/comment-actions'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { commentSchema, type CommentInput } from '@/lib/schemas/comment'
import { toast } from '@/stores/toast-store'

interface CommentFormProps {
  postId: string
  onCreated: () => void
}

export const CommentForm = ({ postId, onCreated }: CommentFormProps) => {
  const [pending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CommentInput>({ resolver: zodResolver(commentSchema), mode: 'onChange', defaultValues: { body: '' } })

  const onSubmit = (values: CommentInput) => {
    startTransition(async () => {
      const result = await createComment(postId, values.body)
      if (!result.ok) return toast.error(result.error)
      reset()
      onCreated()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <Field>
        <Field.Label htmlFor="comment-body" className="sr-only">
          Comment
        </Field.Label>
        <Field.Textarea
          id="comment-body"
          placeholder="Say something…"
          aria-invalid={!!errors.body}
          {...register('body')}
        />
        <Field.Error>{errors.body?.message}</Field.Error>
      </Field>
      <Button type="submit" disabled={!isValid || pending} className="self-end">
        {pending ? 'Posting…' : 'Comment'}
      </Button>
    </form>
  )
}
