import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/common/Button'
import { Input, TextArea } from '@/components/common/Input'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { inquiryFormSchema, type InquiryFormData } from '@/utils/validation'
import { useInquirySubmit } from '@/hooks/useInquirySubmit'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/utils/constants'

interface InquiryFormProps {
  onSuccess: (id: string) => void
}

export function InquiryForm({ onSuccess }: InquiryFormProps) {
  const [savedEmail, setSavedEmail] = useLocalStorage<string>(
    STORAGE_KEYS.MAIL_ADDRESS,
    ''
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      mailAddress: savedEmail,
    },
  })

  const { mutate, isPending, error, reset } = useInquirySubmit()

  const onSubmit = (data: InquiryFormData) => {
    setSavedEmail(data.mailAddress)
    mutate(data, {
      onSuccess: (response) => {
        onSuccess(response.id)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'エラーが発生しました'}
          onRetry={reset}
        />
      )}

      <Input
        label="お名前"
        placeholder="山田 太郎"
        error={errors.userName?.message}
        {...register('userName')}
      />

      <Input
        type="email"
        label="メールアドレス"
        placeholder="example@email.com"
        error={errors.mailAddress?.message}
        {...register('mailAddress')}
      />

      <TextArea
        label="お問い合わせ内容"
        placeholder="ご質問、ご意見、ご感想などをご記入ください"
        rows={5}
        error={errors.reviewText?.message}
        {...register('reviewText')}
      />

      <Button type="submit" isLoading={isPending} className="w-full">
        送信する
      </Button>
    </form>
  )
}
