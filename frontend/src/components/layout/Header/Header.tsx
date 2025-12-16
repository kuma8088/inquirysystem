import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">
              サンプルホテル東京
            </span>
          </Link>
          <nav className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              お問い合わせ
            </Link>
            <Link
              to="/history"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              履歴
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
