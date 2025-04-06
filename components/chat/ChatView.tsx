// Types for the chat messages
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatViewProps {
  messages: Message[];
}

export function ChatView({ messages }: ChatViewProps) {
  return (
    <div className="h-[600px] overflow-y-auto pr-4">
      <div className="flex flex-col gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              message.role === "assistant" ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                message.role === "assistant"
                  ? "bg-primary-500"
                  : "bg-secondary-500"
              }`}
            >
              {message.role === "assistant" ? "AI" : "You"}
            </div>
            <div
              className={`rounded-lg p-4 max-w-[80%] ${
                message.role === "assistant"
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-primary-500 text-white dark:bg-primary-600"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
