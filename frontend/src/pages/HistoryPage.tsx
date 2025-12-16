import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { InquiryList } from '@/components/inquiry/InquiryList'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { searchFormSchema, type SearchFormData } from '@/utils/validation'
import { STORAGE_KEYS } from '@/utils/constants'

export function HistoryPage() {
  const [savedEmail] = useLocalStorage<string>(STORAGE_KEYS.MAIL_ADDRESS, '')
  const [searchEmail, setSearchEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      mailAddress: savedEmail,
    },
  })

  const onSubmit = (data: SearchFormData) => {
    setSearchEmail(data.mailAddress)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          お問い合わせ履歴
        </h1>
        <p className="text-gray-600">
          メールアドレスで過去のお問い合わせを検索できます
        </p>
      </div>

      <Card className="mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="メールアドレスを入力"
              error={errors.mailAddress?.message}
              {...register('mailAddress')}
            />
          </div>
          <Button type="submit">検索</Button>
        </form>
      </Card>

      {searchEmail && <InquiryList mailAddress={searchEmail} />}
    </div>
  )
}
