import React, { useState } from "react"
import axiosInstance from "../../api/axiosInstance"

function StudentAIChat() {

  const [message,setMessage] = useState("")
  const [messages,setMessages] = useState([])
  const [loading,setLoading] = useState(false)

  const sendMessage = async () => {

    if(!message.trim()) return

    const userMessage = {role:"user",content:message}

    setMessages(prev => [...prev,userMessage])
    setLoading(true)

    try{

      const res = await axiosInstance.post("chatvideo/students/ai-chat/",{
        message
      })

      const aiMessage = {
        role:"assistant",
        content:res.data.reply
      }

      setMessages(prev => [...prev,aiMessage])
      setMessage("")

    }catch(err){
      console.log(err)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <div className="h-[500px] overflow-y-auto border rounded-lg p-4 mb-4">

        {messages.map((m,i)=>(
          <div key={i} className={`mb-3 ${m.role==="user"?"text-right":""}`}>
            <span className={`inline-block px-4 py-2 rounded-lg ${
              m.role==="user"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}>
              {m.content}
            </span>
          </div>
        ))}

      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
          className="flex-1 border rounded px-4 py-2"
          placeholder="Ask AI for help..."
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-6 rounded"
        >
          Send
        </button>
      </div>

    </div>
  )
}

export default StudentAIChat