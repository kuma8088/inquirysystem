import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryProvider } from '@/providers/QueryProvider'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { InquiryDetailPage } from '@/pages/InquiryDetailPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inquiry/:id" element={<InquiryDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
