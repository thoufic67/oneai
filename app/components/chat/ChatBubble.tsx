import { Avatar } from "@heroui/react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      duration: 0.5,
      delay: custom * 0.2,
    },
  }),
};

const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      duration: 0.5,
      delay: custom * 0.2,
    },
  }),
};

interface ChatBubbleProps {
  isAssistant: boolean;
  content: string;
  isLoading?: boolean;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group">
        <pre className="p-4 rounded-md bg-black/80 backdrop-blur-md text-white overflow-x-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition-all"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    );
  }

  return (
    <code
      className={`${className} px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded`}
      {...props}
    >
      {children}
    </code>
  );
};

export function ChatBubble({
  isAssistant,
  content,
  isLoading,
}: ChatBubbleProps) {
  return (
    <motion.div
      className={`flex w-full p-2`}
      initial="hidden"
      animate="visible"
      custom={1}
    >
      <div
        className={`flex ${
          isAssistant ? "" : "flex-row-reverse"
        } gap-2 max-w-full break-words text-wrap w-fit`}
      >
        <motion.div
          className={`flex flex-col gap-2 w-full ${
            isAssistant ? "" : "items-start"
          } w-fit`}
        >
          {!isAssistant && (
            <Avatar
              src="https://ui-avatars.com/api/?name=T"
              size="sm"
              radius="full"
            />
          )}
          <div
            className={`flex flex-col gap-2  rounded-lg  whitespace-pre-wrap break-words text-sm ${
              isAssistant
                ? ""
                : "items-end bg-primary text-white shadow-md px-4 py-2"
            } w-fit`}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap markdown-content">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
