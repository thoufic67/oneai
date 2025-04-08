# Frontend Integration Guide

This guide explains how to integrate the OpenRouter chat completion service with your Next.js and React frontend application.

## Table of Contents

- [Setup](#setup)
- [API Integration](#api-integration)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

## Setup

First, ensure your frontend application has the necessary environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api  # Adjust based on your backend URL
```

## API Integration

Create an API service file in your frontend project:

```typescript
// services/api.ts
import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
}

class ChatService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string) => void
  ) {
    try {
      if (request.stream) {
        return this.handleStreamingRequest(request, onChunk);
      } else {
        const response = await axios.post(`${this.baseUrl}/chat`, request);
        return response.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Chat API error: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  private async handleStreamingRequest(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string) => void
  ) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.includes("[DONE]")) continue;

        try {
          const jsonString = line.replace(/^data: /, "").trim();
          if (!jsonString || !line.startsWith("data: ")) continue;

          const json = JSON.parse(jsonString);
          const content = json.choices?.[0]?.delta?.content ?? "";

          if (content) {
            fullResponse += content;
            onChunk?.(content);
          }
        } catch (error) {
          console.error("Error parsing SSE chunk:", error);
        }
      }
    }

    return fullResponse;
  }
}

export const chatService = new ChatService();
```

## Usage Examples

### Basic Usage in a React Component

```typescript
// components/Chat.tsx
import { useState } from "react";
import { chatService } from "../services/api";

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await chatService.createChatCompletion({
        messages: [{ role: "user", content: input }],
        stream: false,
      });

      setMessages((prev) => [...prev, input, response]);
      setInput("");
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### Streaming Example

```typescript
// components/StreamingChat.tsx
import { useState, useEffect } from "react";
import { chatService } from "../services/api";

export default function StreamingChat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setMessages((prev) => [...prev, input]);
      setCurrentResponse("");

      await chatService.createChatCompletion(
        {
          messages: [{ role: "user", content: input }],
          stream: true,
        },
        (chunk) => {
          setCurrentResponse((prev) => prev + chunk);
        }
      );

      setMessages((prev) => [...prev, currentResponse]);
      setInput("");
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
        {currentResponse && <div>{currentResponse}</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Error Handling

The service includes built-in error handling for common scenarios:

- Network errors
- API response errors
- Stream parsing errors

Implement try-catch blocks in your components to handle these errors appropriately:

```typescript
try {
  await chatService.createChatCompletion(/* ... */);
} catch (error) {
  if (error instanceof Error) {
    // Handle specific error cases
    console.error("Chat error:", error.message);
    // Update UI to show error message
  }
}
```

## TypeScript Types

For better type safety, you can export and use these types in your frontend:

```typescript
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  choices: Array<{
    delta?: {
      content: string;
    };
    message?: {
      content: string;
    };
  }>;
}
```

Remember to:

1. Handle loading states appropriately
2. Implement proper error boundaries
3. Consider implementing retry logic for failed requests
4. Add appropriate TypeScript types for all components and functions
5. Use environment variables for configuration
6. Implement proper security measures (rate limiting, input validation, etc.)
