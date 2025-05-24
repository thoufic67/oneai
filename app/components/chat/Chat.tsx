"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import {
  chatService,
  Message,
  Conversation,
  ChatMessage,
} from "@/services/api";
import { useAuth } from "../auth-provider";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { Button, useDisclosure } from "@heroui/react";
import { AlertCircle, Crown, Send } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";
import { getChatModels, getImageModels, ModelType } from "@/lib/models";
import type {
  StreamResponse,
  UploadedImageMeta as BaseUploadedImageMeta,
} from "@/types";

// Extend UploadedImageMeta for UI-specific fields
interface UploadedImageMeta extends BaseUploadedImageMeta {
  attachment_type: string;
  attachment_url: string;
  filePath: string;
  localPreviewUrl: string;
  loading: boolean;
  error?: string;
}

const imageGenLoadingText = [
  "Me trying to draw what's in my head... but with AI superpowers! 🎨",
  "Cooking the image for you... 🍳",
  "Teaching AI to paint like Bob Ross... Happy little pixels incoming! 🎨",
  "Me trying to draw what's in my head... but with AI superpowers! 🎨",
  "Hold on tight, I'm creating a masterpiece for you! 🎨",
  "I'm drawing a picture of your dream... just a sec! 🎨",
  "Unleashing my inner Picasso... with a digital twist! 🎨",
  "Teaching robots to finger paint... almost there! 🤖",
  "Making art faster than you can say 'abstract expressionism'! 🖼️",
  "Pixel by pixel, creating magic... beep boop! ✨",
  "My AI crayons are working overtime! 🖍️",
];

// Add utility functions for session storage with expiration
const storeWithExpiry = (key: string, value: any) => {
  if (typeof window === "undefined") return;

  const item = {
    value: value,
    expiry: new Date().getTime() + 24 * 60 * 60 * 1000 * 365, // 1 day expiry
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};

// Add greeting utility function
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getWithExpiry = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;

  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return defaultValue;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
      sessionStorage.removeItem(key);
      return defaultValue;
    }

    return item.value;
  } catch (e) {
    return defaultValue;
  }
};

interface ChatProps {
  initialMessages?: ChatMessage[];
  initialConversation?: Conversation;
}

export function Chat({ initialMessages = [], initialConversation }: ChatProps) {
  const router = useRouter();

  const { user, quotaData, subscriptionData } = useAuth();

  // State for current messages display
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState("");

  // Load initial values from session storage with expiration
  const [selectedModel, setSelectedModel] = useState<ModelType>(() =>
    getWithExpiry("aiflo_selected_model", getChatModels()[0].value)
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(() =>
    getWithExpiry("aiflo_web_search_enabled", false)
  );
  const [imageGenEnabled, setImageGenEnabled] = useState(() =>
    getWithExpiry("aiflo_image_gen_enabled", false)
  );
  const imageLoadingText = useMemo(() => {
    return imageGenLoadingText[
      Math.floor(Math.random() * imageGenLoadingText.length)
    ];
  }, [isLoading, imageGenEnabled]);

  const [currentChatId, setCurrentChatId] = useState<string | null>(
    initialConversation?.id || null
  );
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<
    Conversation | undefined
  >(initialConversation);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const animateVideoRef = useRef<HTMLVideoElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tempUserName, setTempUserName] = useState("");
  const models = useMemo(() => {
    if (imageGenEnabled) {
      setSelectedModel(getImageModels()[0].value);
      return getImageModels();
    }
    setSelectedModel(
      getWithExpiry("aiflo_selected_model", getChatModels()[0].value)
    );
    return getChatModels();
  }, [imageGenEnabled]);

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageMeta[]>([]);

  // Cleanup function to revoke object URLs
  const cleanupImagePreviews = () => {
    // Clean up preview URLs from uploadedImages
    uploadedImages.forEach((img) => {
      if (img.localPreviewUrl) {
        URL.revokeObjectURL(img.localPreviewUrl);
      }
    });
    // Clean up preview URLs from selectedImageFiles
    selectedImageFiles.forEach((file) => {
      try {
        URL.revokeObjectURL(URL.createObjectURL(file));
      } catch {}
    });
  };

  useEffect(() => {
    console.log(quotaData);
  }, [quotaData]);

  // Persist preferences to session storage when they change
  useEffect(() => {
    storeWithExpiry("aiflo_selected_model", selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    storeWithExpiry("aiflo_web_search_enabled", webSearchEnabled);
  }, [webSearchEnabled]);

  useEffect(() => {
    storeWithExpiry("aiflo_image_gen_enabled", imageGenEnabled);
  }, [imageGenEnabled]);

  useLayoutEffect(() => {
    if (animateVideoRef.current) {
      if (isLoading && !imageGenEnabled) {
        animateVideoRef.current?.play();
      } else {
        animateVideoRef.current?.pause();
      }
    }
    return () => {
      if (animateVideoRef.current) {
        animateVideoRef.current.pause();
      }
    };
  }, [isLoading, animateVideoRef.current, imageGenEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // --- [START] Create image prefix logic ---
  // const IMAGE_PREFIX = "Create image ";

  // Custom onValueChange handler to detect manual prefix removal
  const handleInputValueChange = (val: string) => {
    setInputMessage(val);
  };
  // --- [END] Create image prefix logic ---

  const handleSubmit = async () => {
    if (inputMessage.trim().length === 0) return;
    setIsLoading(true);

    // Store previous state for potential revert
    const prevMessages = [...messages];
    const prevInputMessage = inputMessage;
    const prevUploadedImages = [...uploadedImages];
    const prevSelectedImageFiles = [...selectedImageFiles];

    try {
      setError(null);

      // Add user message to UI for immediate feedback
      const userMessage: ChatMessage = {
        role: "user",
        content: inputMessage,
        model_id: selectedModel,
        id: "",
        conversation_id: currentChatId || "",
        user_id: user?.id || "",
        created_at: new Date().toISOString(),
        attachments:
          uploadedImages.length > 0
            ? uploadedImages.map((img) => ({
                attachment_type: img.attachment_type as
                  | "image"
                  | "video"
                  | "audio"
                  | "document"
                  | "other",
                attachment_url: img.attachment_url,
              }))
            : [],
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage("");
      setUploadedImages([]);
      setSelectedImageFiles([]);
      cleanupImagePreviews();

      // Prepare message history for API call
      const messageHistory: Message[] = updatedMessages;

      // If image generation is enabled, call API for image
      if (imageGenEnabled) {
        // Find the last assistant message and use its metadata.response_id as previous_response_id if present
        const lastAssistantMessage = [...messages]
          .reverse()
          .find((msg) => msg.role === "assistant" && msg.metadata?.response_id);
        const previous_response_id =
          lastAssistantMessage?.metadata?.response_id || "";

        // --- Streaming image generation ---
        setStreamingMessage({ role: "assistant", content: "" });
        let partialImageChunks: string[] = [];
        let finalImageContent: string = "";
        let finalConvId: string | null = null;
        await chatService.createChatCompletion(
          {
            messages: messageHistory,
            model: selectedModel,
            image: true,
            stream: true,
            conversationId: currentChatId || undefined,
            previous_response_id,
          },
          (chunk, convId) => {
            // Each chunk is a partial image markdown or progress
            partialImageChunks.push(chunk);
            setStreamingMessage((prev) =>
              prev
                ? { ...prev, content: partialImageChunks.join("\n") }
                : { role: "assistant", content: chunk }
            );
            if (convId && !currentChatId) {
              setCurrentChatId(convId);
            }
          },
          (finalText, convId) => {
            finalImageContent = finalText;
            finalConvId = convId;
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: "",
                conversation_id: currentChatId || "",
                user_id: user?.id || "",
                model_id: selectedModel,
                created_at: new Date().toISOString(),
                role: "assistant",
                content: finalText,
              },
            ]);
            setStreamingMessage(null);
            if (convId && currentChatId !== convId) {
              setCurrentChatId(convId);
              router.push(`/c/${convId}?`);
            }
            inputRef.current?.focus();
          }
        );
        setIsLoading(false);
        return;
      }

      // Initialize streaming message
      setStreamingMessage({ role: "assistant", content: "" });

      // Get AI response with streaming
      const { text, conversationId } = await chatService.createChatCompletion(
        {
          messages: messageHistory,
          stream: true,
          model: selectedModel,
          web: webSearchEnabled,
          conversationId: currentChatId || undefined,
        },
        (chunk, convId) => {
          // Immediately update UI with each chunk
          setStreamingMessage((prev) =>
            prev
              ? { ...prev, content: prev.content + chunk }
              : { role: "assistant", content: chunk }
          );

          // If we got a new conversation ID and we didn't have one before, update it
          if (convId && !currentChatId) {
            setCurrentChatId(convId);

            // Create a temporary conversation with default title
            const tempTitle =
              userMessage.content.slice(0, 30) +
              (userMessage.content.length > 30 ? "..." : "");
            const tempConversation: Conversation = {
              id: convId,
              title: tempTitle,
              user_id: "", // Will be filled by the backend
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_message_at: new Date().toISOString(),
            };
            setCurrentConversation(tempConversation);
          }
        },
        async (finalText, convId) => {
          if (convId && currentChatId !== convId) {
            setCurrentChatId(convId);
            router.push(`/c/${convId}?`);
          }

          // Add the final streamed message to the messages array
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: "",
              conversation_id: currentChatId || "",
              user_id: user?.id || "",
              model_id: selectedModel,
              created_at: new Date().toISOString(),
              role: "assistant",
              content: finalText || streamingMessage?.content || "",
            },
          ]);

          setStreamingMessage(null);

          // Focus the chat input after response is complete
          inputRef.current?.focus();
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Chat error:", error);
      setStreamingMessage(null);
      // Revert all states to previous if this was the first message (optimistic update failed)
      setMessages(prevMessages);
      setInputMessage(prevInputMessage);
      setUploadedImages(prevUploadedImages);
      setSelectedImageFiles(prevSelectedImageFiles);
      // Clean up any new previews and restore previous previews
      cleanupImagePreviews();
      // Restore previews for previous uploaded images
      prevUploadedImages.forEach((img) => {
        if (img.localPreviewUrl) {
          // Recreate object URL if needed (browser will handle duplicates)
          URL.createObjectURL(new File([], img.filePath));
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async (navigate = true) => {
    setMessages([]);
    setStreamingMessage(null);
    setError(null);
    setInputMessage("");
    setCurrentChatId(null);
    // Don't reset model and web search preferences to preserve user's choices
    setCurrentConversation(undefined);

    // Navigate to /new if needed
    if (navigate) {
      router.push("/new");
    }

    inputRef.current?.focus();
  };

  // Handle model change and save to session storage
  const handleModelChange = (model: string) => {
    setSelectedModel(model as ModelType);
    storeWithExpiry("aiflo_selected_model", model);
  };

  // Handle web search toggle and save to session storage
  const handleWebSearchToggle = (enabled: boolean) => {
    setWebSearchEnabled(enabled);
    storeWithExpiry("aiflo_web_search_enabled", enabled);
  };

  // Handle image generation toggle and save to session storage
  const handleImageGenToggle = (enabled: boolean) => {
    setImageGenEnabled(enabled);
    storeWithExpiry("aiflo_image_gen_enabled", enabled);
  };

  // Combine regular messages with streaming message for display
  const displayMessages = useMemo(() => {
    return messages;
  }, [messages]);

  // Create shared input component to avoid duplication
  const renderChatInput = () => (
    <div className="flex flex-col gap-2">
      <ChatInput
        ref={inputRef}
        disabled={isLoading}
        value={inputMessage}
        onValueChange={handleInputValueChange}
        placeholder={imageGenEnabled ? "Create image ..." : "Ask AI anything"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        endContent={
          <Button
            isIconOnly
            variant="ghost"
            radius="full"
            onPress={handleSubmit}
            isDisabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        }
        modelOptions={models}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={handleWebSearchToggle}
        imageGenEnabled={imageGenEnabled}
        onImageGenToggle={handleImageGenToggle}
        onImageSelected={setSelectedImageFiles}
        onImageUploadComplete={setUploadedImages}
        onImageCleanup={cleanupImagePreviews}
        selectedImages={selectedImageFiles}
      />
    </div>
  );

  const handleSaveSettings = () => {
    setTempUserName(tempUserName);
    onClose();
  };

  return (
    <div
      className="flex h-full w-full max-h-full justify-center items-center overflow-y-auto overflow-x-hidden"
      ref={chatContainerRef}
    >
      <div className="flex flex-col  flex-1 max-w-4xl w-full h-full">
        {currentChatId && messages.length > 0 && (
          <p className="hidden  md:block sm:max-w-sm lg:max-w-xl  mx-auto z-50 fixed top-5 left-0 right-0 text-sm sm:text-lg font-bold text-center w-full sm:max-w-2xl text-ellipsis overflow-hidden whitespace-nowrap">
            {currentConversation?.title || "..."}
          </p>
        )}

        <AnimatePresence mode="wait">
          {loadingConversation ? (
            <div className="flex flex-col gap-6 justify-start items-center h-full w-full max-w-2xl mx-auto py-12">
              {/* User bubble skeleton */}
              <div className="flex w-full p-2 justify-end">
                <div className="flex gap-2 w-full items-end justify-end">
                  <div className="flex flex-col gap-2 items-end w-full max-w-[90%]">
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-lg" />
                  </div>
                  {/* User avatar placeholder */}
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>

              {/* Assistant bubble skeleton */}
              <div className="flex w-full p-2">
                <div className="flex gap-2 w-full items-start">
                  {/* Assistant avatar placeholder */}
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col gap-2 items-start w-full max-w-[90%]">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <React.Fragment key={index}>
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-3 w-full rounded-lg" />
                        <Skeleton className="h-3 w-96 rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              key="empty-state"
              className="flex flex-col h-full justify-center items-center -mt-24"
            >
              <motion.div className="flex flex-col justify-center items-center gap-4 mb-8">
                <p className="text-left text-xl font-normal delay-100 sm:text-2xl  leading-9">
                  <span className="drop-shadow-2xl relative mb-5 duration-700 transition-[opacity,filter] text-transparent bg-clip-text bg-gradient-to-r to-purple-400 from-pink-600">
                    {`${getGreeting()}`}
                  </span>
                  {user?.user_metadata?.full_name
                    ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                    : ""}
                  !
                  <br />
                  <span className="drop-shadow-2xl text-gray-500">
                    How can I help you today?
                  </span>
                </p>
              </motion.div>
              <motion.div
                className="w-full max-w-3xl px-4"
                layout
                layoutId="chat-input-container"
              >
                {renderChatInput()}
              </motion.div>
              {quotaData?.subscription?.tier === "free" && (
                <div className="p-2 text-center text-sm text-gray-500 flex gap-1">
                  You&apos;ve very limited quota.{" "}
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1 text-blue-500"
                  >
                    <span className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-orange-500" />
                    </span>
                    Upgrade for more usage.
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat-view"
              className="flex flex-col h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1 flex flex-col max-h-full gap-4 w-full no-scrollbar p-4">
                {displayMessages.map((message, index) => (
                  <ChatBubble
                    key={index}
                    isAssistant={message.role === "assistant"}
                    content={message.content}
                    isLoading={message === streamingMessage && isLoading}
                    model={message.model_id}
                    isReadonly={false}
                    attachments={message.attachments}
                  />
                ))}
                {streamingMessage && (
                  <ChatBubble
                    isAssistant={true}
                    content={streamingMessage.content}
                    isLoading={true}
                    model={selectedModel}
                    isReadonly={true}
                  />
                )}
                {imageGenEnabled && isLoading && (
                  <div className="relative  gap-2 w-fit">
                    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm text-gray-500 z-50">
                      {imageLoadingText}
                    </p>
                    <Skeleton className="w-[20rem] h-[20rem] rounded-lg"></Skeleton>
                  </div>
                )}
                <div className={`relative w-10 h-10 rounded-full pb-52`}>
                  <video
                    ref={animateVideoRef}
                    src="/loading animation.mp4"
                    // autoPlay
                    playsInline
                    muted
                    loop
                    className="w-10 h-10 object-cover object-center transform scale-150 rounded-full"
                  />
                </div>
              </div>
              <div className="fixed w-full bottom-0 left-0 right-0 w-full backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
                {error && (
                  <div className="p-4 text-red-500 bg-red-100 rounded mb-4 mx-auto flex items-center gap-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error || "An error occurred"}
                  </div>
                )}

                <motion.div
                  className="w-full"
                  layout
                  layoutId="chat-input-container"
                >
                  <div className="max-w-3xl mx-auto p-4">
                    {renderChatInput()}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
