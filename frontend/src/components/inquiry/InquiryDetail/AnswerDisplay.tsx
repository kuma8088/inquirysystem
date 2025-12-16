interface AnswerDisplayProps {
  answer: string
}

export function AnswerDisplay({ answer }: AnswerDisplayProps) {
  // Convert markdown-like formatting to HTML-safe display
  const formattedAnswer = answer.split('\n').map((line, i) => {
    // Handle bold text **text**
    const boldProcessed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Handle list items
    if (line.startsWith('- ')) {
      return (
        <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: boldProcessed.slice(2) }} />
      )
    }

    if (line.trim() === '') {
      return <br key={i} />
    }

    return (
      <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: boldProcessed }} />
    )
  })

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-800 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        AI回答
      </h3>
      <div className="text-gray-700 whitespace-pre-wrap">
        {formattedAnswer}
      </div>
    </div>
  )
}
