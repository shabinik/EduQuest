import React, { useState, useRef, useEffect } from "react"
import axiosInstance from "../../api/axiosInstance"

function StudentAIChat() {
  const [message, setMessage]   = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = { role: "user", content: message }
    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setLoading(true)

    try {
      const res = await axiosInstance.post("chatvideo/students/ai-chat/", { message })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">🤖 AI Tutor</h1>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-2xl p-4 mb-4 bg-gray-50 space-y-3">

        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-3">🎓</p>
            <p className="font-medium">Ask me anything — maths, science, history, or any subject!</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 flex-shrink-0">
              🤖
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask AI for help... (Enter to send, Shift+Enter for new line)"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          style={{ minHeight: 46, maxHeight: 120 }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Powered by Groq · Llama 3.1</p>
    </div>
  )
}

export default StudentAIChat