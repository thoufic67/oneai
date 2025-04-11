# Frontend Integration Guide

This guide explains how to integrate the OpenRouter chat completion service with your Next.js and React frontend application.

## Table of Contents

- [Setup](#setup)
- [Authentication with Google OAuth](#authentication-with-google-oauth)
- [API Integration](#api-integration)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Conversation Management](#conversation-management)
- [Automatic Conversation Title Generation](#automatic-conversation-title-generation)

## Setup

First, ensure your frontend application has the necessary environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1  # Adjust based on your backend URL
```

## Authentication with Google OAuth

The backend supports Google OAuth2 for authentication. Here's how to integrate it with your frontend:

### Authentication Service

Create an authentication service file in your frontend project:

```typescript
// services/authService.ts
import axios from "axios";

interface User {
  id: string;
  email: string;
  name?: string;
  picture_url?: string;
}

class AuthService {
  private readonly baseUrl: string;
  private tokenKey = "auth_tokens";

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";
  }

  // Redirect to Google login page
  initiateGoogleLogin() {
    window.location.href = `${this.baseUrl}/auth/google`;
  }

  // Handle the Google OAuth callback
  async handleGoogleCallback(code: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/auth/google/callback?code=${code}`
      );
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens in local storage or in secure HTTP-only cookies
      this.saveTokens(accessToken, refreshToken);

      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Authentication error: ${
            error.response?.data?.error || error.message
          }`
        );
      }
      throw error;
    }
  }

  // Get the current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const response = await axios.get(`${this.baseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  // Refresh the access token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await axios.post(`${this.baseUrl}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      this.saveTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (error) {
      this.logout(); // Clear tokens if refresh fails
      throw error;
    }
  }

  // Logout the user
  async logout() {
    try {
      const token = this.getAccessToken();
      if (token) {
        await axios.post(
          `${this.baseUrl}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get access token from storage
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.accessToken : null;
  }

  // Get refresh token from storage
  private getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.refreshToken : null;
  }

  // Save tokens to storage
  private saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(
      this.tokenKey,
      JSON.stringify({ accessToken, refreshToken })
    );
  }

  // Get tokens from storage
  private getTokens(): { accessToken: string; refreshToken: string } | null {
    const tokensJson = localStorage.getItem(this.tokenKey);
    return tokensJson ? JSON.parse(tokensJson) : null;
  }

  // Clear tokens from storage
  private clearTokens() {
    localStorage.removeItem(this.tokenKey);
  }
}

export const authService = new AuthService();
```

### Setting Up an Axios Interceptor

To automatically handle token refresh and authentication headers, set up an Axios interceptor:

```typescript
// services/axiosSetup.ts
import axios from "axios";
import { authService } from "./authService";

// Create an axios instance
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        authService.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Login Component

Create a simple login component:

```tsx
// components/Login.tsx
import React from "react";
import { authService } from "../services/authService";

export default function Login() {
  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  return (
    <div className="login-container">
      <h1>Welcome to OneAI</h1>
      <p>Sign in to continue</p>

      <button className="google-login-button" onClick={handleGoogleLogin}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          {/* Google icon SVG path */}
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
```

### OAuth Callback Page

Create a callback page to handle the OAuth response:

```tsx
// pages/auth/callback.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../../services/authService";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for router query to be available
    if (!router.isReady) return;

    const { code, error: queryError } = router.query;

    if (queryError) {
      setError(queryError as string);
      setLoading(false);
      return;
    }

    if (!code) {
      setError("No authorization code received");
      setLoading(false);
      return;
    }

    // Process the code
    authService
      .handleGoogleCallback(code as string)
      .then(() => {
        // Redirect to home page or dashboard after successful login
        router.push("/");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router.isReady, router.query]);

  if (loading) {
    return <div>Authenticating...</div>;
  }

  if (error) {
    return <div>Authentication Error: {error}</div>;
  }

  return <div>Authentication successful. Redirecting...</div>;
}
```

### Protected Route HOC

Create a higher-order component to protect routes that require authentication:

```tsx
// components/withAuth.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

export default function withAuth(WrappedComponent: React.ComponentType) {
  return function WithAuth(props: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
      async function checkAuth() {
        try {
          const currentUser = await authService.getCurrentUser();

          if (!currentUser) {
            // Redirect to login if not authenticated
            router.replace("/login");
            return;
          }

          setUser(currentUser);
          setLoading(false);
        } catch (error) {
          console.error("Authentication check failed:", error);
          router.replace("/login");
        }
      }

      checkAuth();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}
```

### Usage in Pages

To protect a page:

```tsx
// pages/dashboard.tsx
import withAuth from "../components/withAuth";

function Dashboard({ user }) {
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {/* Dashboard content */}
    </div>
  );
}

export default withAuth(Dashboard);
```

### Adding Authentication to Chat Integration

When using the chat service, ensure it includes authentication headers:

```typescript
// Update the chat service to use the authenticated axios instance
import api from './axiosSetup';

// Then in your ChatService methods:
async getConversations(): Promise<Conversation[]> {
  try {
    const response = await api.get(`/conversations`);
    return response.data.conversations;
  } catch (error) {
    throw new Error(`Error fetching conversations: ${error.message}`);
  }
}
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
  ): Promise<{ text: string; conversationId: string; title?: string }> {
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
    let conversationTitle = "";

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
            // Check if the response includes a title (for new conversations)
            if (json.title) {
              conversationTitle = json.title;
            }
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
      title: conversationTitle || undefined,
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
          `Error fetching conversations: ${
            error.response?.data?.error || error.message
          }`
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
          `Error fetching conversation: ${
            error.response?.data?.error || error.message
          }`
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
          `Error fetching messages: ${
            error.response?.data?.error || error.message
          }`
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
          `Error creating conversation: ${
            error.response?.data?.error || error.message
          }`
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
          `Error updating conversation: ${
            error.response?.data?.error || error.message
          }`
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
          `Error deleting conversation: ${
            error.response?.data?.error || error.message
          }`
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
import { useEffect, useState } from "react";
import { chatService } from "../services/api";
import { Conversation } from "../types";

export default function ConversationList({ onSelectConversation }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await chatService.getConversations();
        setConversations(data);
        setError("");
      } catch (err) {
        setError("Failed to load conversations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleCreateNewConversation = async () => {
    try {
      const newConversation = await chatService.createConversation(
        "New Conversation"
      );
      setConversations([newConversation, ...conversations]);
      onSelectConversation(newConversation.id);
    } catch (err) {
      setError("Failed to create new conversation");
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(id);
      setConversations(conversations.filter((conv) => conv.id !== id));
    } catch (err) {
      setError("Failed to delete conversation");
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
          {conversations.map((conversation) => (
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
import { useState, useEffect } from "react";
import { chatService } from "../services/api";
import { Message, ChatMessage } from "../types";

interface Props {
  conversationId?: string;
  onConversationCreated?: (id: string, title?: string) => void;
}

export default function ConversationChat({
  conversationId,
  onConversationCreated,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversationId || ""
  );

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
      const conversationMessages = await chatService.getConversationMessages(
        id
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    // Prepare the message history to send
    const messageHistory: Message[] = [
      ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: currentMessage },
    ];

    // Optimistically add user message to UI
    const optimisticUserMsg = {
      id: "temp-" + Date.now(),
      conversation_id: activeConversationId,
      user_id: "",
      role: "user" as const,
      model_id: "",
      content: currentMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setCurrentMessage("");
    setStreamingResponse("");

    try {
      setLoading(true);

      // Get streaming response with potential new conversation ID and title
      const {
        text,
        conversationId: newConversationId,
        title,
      } = await chatService.createChatCompletion(
        {
          messages: messageHistory,
          conversationId: activeConversationId || undefined,
          stream: true,
          model: "claude-3-opus-20240229", // Can be configurable
        },
        (chunk, convId) => {
          setStreamingResponse((prev) => prev + chunk);
          if (!activeConversationId && convId) {
            setActiveConversationId(convId);
            onConversationCreated?.(convId, title);
          }
        }
      );

      // If we got a new conversation ID, update it
      if (newConversationId && newConversationId !== activeConversationId) {
        setActiveConversationId(newConversationId);
        onConversationCreated?.(newConversationId, title);
      }

      // Load the full message history from the server
      if (activeConversationId || newConversationId) {
        await loadMessages(activeConversationId || newConversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setStreamingResponse("");
    }
  };

  return (
    <div className="conversation-chat">
      <div className="messages-container">
        {messages.map((message) => (
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

        {loading && !streamingResponse && (
          <div className="loading">Thinking...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
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
import { useState } from "react";
import ConversationList from "../components/ConversationList";
import ConversationChat from "../components/ConversationChat";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();

  // Handle both conversation ID and title from new conversations
  const handleConversationCreated = (id: string, title?: string) => {
    setSelectedConversationId(id);
    // Optionally refresh the conversation list to show the new title
    // or update the title in the current list if using state management
  };

  return (
    <div className="chat-page">
      <div className="sidebar">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>
      <div className="chat-container">
        {selectedConversationId ? (
          <ConversationChat conversationId={selectedConversationId} />
        ) : (
          <ConversationChat onConversationCreated={handleConversationCreated} />
        )}
      </div>
    </div>
  );
}
```

## Automatic Conversation Title Generation

The backend automatically generates a descriptive title for new conversations using a GPT-3.5-turbo model based on the user's first message. This provides a better user experience as conversations are named meaningfully without requiring manual input.

### How It Works

1. When a user starts a new conversation (no `conversationId` provided):

   - The backend creates a conversation with a default title (truncated user message)
   - In the background, it sends the first user message to GPT-3.5-turbo to generate a concise title (max 5 words)
   - The generated title is stored in the database and returned in the final SSE message

2. The title is included in the final SSE message with the `done` flag:

   ```json
   {
     "done": true,
     "conversationId": "123e4567-e89b-12d3-a456-426614174000",
     "title": "Weather Forecast Question"
   }
   ```

3. Your frontend can use this title to:
   - Display in the conversation list
   - Show as the page title
   - Use in breadcrumb navigation

### Frontend Implementation

In your streaming handler, capture the title from the "done" message:

```typescript
// Extract title from SSE response
const { text, conversationId, title } = await chatService.createChatCompletion({
  messages: [{ role: "user", content: "What's the weather like today?" }],
  stream: true,
});

console.log(`New conversation created: ${conversationId} with title: ${title}`);
```

The title is only returned for new conversations. For existing conversations, the title field will be undefined.
