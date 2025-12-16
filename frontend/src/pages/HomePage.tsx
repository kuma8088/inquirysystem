import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { InquiryForm } from '@/components/inquiry/InquiryForm'

export function HomePage() {
  const navigate = useNavigate()

  const handleSuccess = (id: string) => {
    navigate(`/inquiry/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          お問い合わせ
        </h1>
        <p className="text-gray-600">
          ご質問、ご意見、ご感想をお聞かせください。
          <br />
          AIが自動で回答いたします。
        </p>
      </div>

      <Card>
        <InquiryForm onSuccess={handleSuccess} />
      </Card>
    </div>
  )
}
