export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} サンプルホテル東京. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
