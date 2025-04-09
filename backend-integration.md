# Frontend Integration Guide

This guide explains how to integrate the OpenRouter chat completion service with your Next.js and React frontend application.

## Table of Contents

- [Setup](#setup)
- [API Integration](#api-integration)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Conversation Management](#conversation-management)

## Setup

First, ensure your frontend application has the necessary environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1  # Adjust based on your backend URL
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
  conversationId?: string; // Optional - use existing conversation ID
}

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  model_id: string;
  content: string;
  tokens_used?: number;
  parent_message_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

class ChatService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string, conversationId: string) => void
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
    onChunk?: (chunk: string, conversationId: string) => void
  ): Promise<{ text: string; conversationId: string }> {
    const response = await fetch(`${this.baseUrl}/chat/stream`, {
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
    let currentConversationId = request.conversationId || "";

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

          // Check if this is the done message
          if (json.done) {
            currentConversationId =
              json.conversationId || currentConversationId;
            continue;
          }

          const content = json.content || "";
          currentConversationId = json.conversationId || currentConversationId;

          if (content) {
            fullResponse += content;
            onChunk?.(content, currentConversationId);
          }
        } catch (error) {
          console.error("Error parsing SSE chunk:", error);
        }
      }
    }

    return {
      text: fullResponse,
      conversationId: currentConversationId,
    };
  }

  // Conversation Management Methods

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/conversations`);
      return response.data.conversations;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching conversations: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await axios.get(`${this.baseUrl}/conversations/${id}`);
      return response.data.conversation;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<ChatMessage[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/conversations/${conversationId}/messages`
      );
      return response.data.messages;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching messages: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async createConversation(title: string): Promise<Conversation> {
    try {
      const response = await axios.post(`${this.baseUrl}/conversations`, {
        title,
      });
      return response.data.conversation;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error creating conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async updateConversation(id: string, title: string): Promise<Conversation> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/conversations/${id}`,
        { title }
      );
      return response.data.conversation;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error updating conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/conversations/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error deleting conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
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
  conversationId?: string;
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
  conversationId?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  model_id: string;
  content: string;
  tokens_used?: number;
  parent_message_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
```

## Conversation Management

The conversation management feature allows you to create, retrieve, update, and delete conversations. Here's how to use it in your React application:

### Conversation List Component

```typescript
// components/ConversationList.tsx
import { useEffect, useState } from 'react';
import { chatService } from '../services/api';
import { Conversation } from '../types';

export default function ConversationList({ onSelectConversation }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await chatService.getConversations();
        setConversations(data);
        setError('');
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleCreateNewConversation = async () => {
    try {
      const newConversation = await chatService.createConversation('New Conversation');
      setConversations([newConversation, ...conversations]);
      onSelectConversation(newConversation.id);
    } catch (err) {
      setError('Failed to create new conversation');
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(id);
      setConversations(conversations.filter(conv => conv.id !== id));
    } catch (err) {
      setError('Failed to delete conversation');
      console.error(err);
    }
  };

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="conversation-list">
      <button onClick={handleCreateNewConversation}>New Conversation</button>

      {conversations.length === 0 ? (
        <div>No conversations yet</div>
      ) : (
        <ul>
          {conversations.map(conversation => (
            <li
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className="conversation-item"
            >
              <span>{conversation.title}</span>
              <button
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                className="delete-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Chat with Conversation Component

```typescript
// components/ConversationChat.tsx
import { useState, useEffect } from 'react';
import { chatService } from '../services/api';
import { Message, ChatMessage } from '../types';

interface Props {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export default function ConversationChat({ conversationId, onConversationCreated }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string>(conversationId || '');

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadMessages = async (id: string) => {
    try {
      setLoading(true);
      const conversationMessages = await chatService.getConversationMessages(id);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    // Prepare the message history to send
    const messageHistory: Message[] = [
      ...messages.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: currentMessage }
    ];

    // Optimistically add user message to UI
    const optimisticUserMsg = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConversationId,
      user_id: '',
      role: 'user' as const,
      model_id: '',
      content: currentMessage,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticUserMsg]);
    setCurrentMessage('');
    setStreamingResponse('');

    try {
      setLoading(true);

      // Get streaming response with potential new conversation ID
      const { text, conversationId: newConversationId } = await chatService.createChatCompletion(
        {
          messages: messageHistory,
          conversationId: activeConversationId || undefined,
          stream: true,
          model: 'claude-3-opus-20240229', // Can be configurable
        },
        (chunk, convId) => {
          setStreamingResponse(prev => prev + chunk);
          if (!activeConversationId && convId) {
            setActiveConversationId(convId);
            onConversationCreated?.(convId);
          }
        }
      );

      // If we got a new conversation ID, update it
      if (newConversationId && newConversationId !== activeConversationId) {
        setActiveConversationId(newConversationId);
        onConversationCreated?.(newConversationId);
      }

      // Load the full message history from the server
      if (activeConversationId || newConversationId) {
        await loadMessages(activeConversationId || newConversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setStreamingResponse('');
    }
  };

  return (
    <div className="conversation-chat">
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-role">{message.role}</div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {streamingResponse && (
          <div className="message assistant">
            <div className="message-role">assistant</div>
            <div className="message-content">{streamingResponse}</div>
          </div>
        )}

        {loading && !streamingResponse && <div className="loading">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={currentMessage}
          onChange={e => setCurrentMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !currentMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### Main Chat Page Component

```typescript
// pages/chat.tsx
import { useState } from 'react';
import ConversationList from '../components/ConversationList';
import ConversationChat from '../components/ConversationChat';

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  return (
    <div className="chat-page">
      <div className="sidebar">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>
      <div className="chat-container">
        {selectedConversationId ? (
          <ConversationChat
            conversationId={selectedConversationId}
          />
        ) : (
          <ConversationChat
            onConversationCreated={setSelectedConversationId}
          />
        )}
      </div>
    </div>
  );
}
```

Remember to:

1. Handle loading states appropriately
2. Implement proper error boundaries
3. Consider implementing retry logic for failed requests
4. Add appropriate TypeScript types for all components and functions
5. Use environment variables for configuration
6. Implement proper security measures (rate limiting, input validation, etc.)
