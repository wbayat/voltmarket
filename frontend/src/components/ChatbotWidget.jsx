import { useState, useRef, useEffect } from "react";
import { apiRequest } from "../api/client";

// The initial message that is shown.
// TODO: Add user's name if logged in. Example: Hi John, ...
const INTRO_MESSAGE = {
  role: "assistant",
  content: "Hi, I'm VoltMarket Assistant. How can I help you?",
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // send message function
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    // set loading to true until response is recieved
    setLoading(true);

    try {
      const data = await apiRequest("/chatbot", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 h-96 bg-white border border-black rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="px-4 py-3 border-b border-black flex items-center justify-between">
            <span className="font-semibold text-black">
              VoltMarket Assistant
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-black"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm max-w-[85%] px-3 py-2 rounded-2xl ${
                  msg.role === "user"
                    ? "self-end bg-black text-white rounded-br-sm"
                    : "self-start bg-white border border-gray-200 text-black rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-white border border-gray-200 text-gray-400 text-sm px-3 py-2 rounded-2xl rounded-bl-sm">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-black p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm rounded-full bg-gray-100 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:opacity-80 disabled:opacity-40"
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 shadow-lg text-xl"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default ChatbotWidget;
