import { Avatar } from "@heroui/react";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { Check, Copy, RefreshCcw } from "lucide-react";
import React from "react";

interface ChatBubbleProps {
  isAssistant: boolean;
  content: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

// Heading components for different levels
const Heading = ({ level, children }: { level: number; children: any }) => {
  const className = `font-bold mb-1 mt-2 leading-tight ${
    level === 1
      ? "text-2xl"
      : level === 2
        ? "text-xl"
        : level === 3
          ? "text-lg"
          : level === 4
            ? "text-base"
            : level === 5
              ? "text-sm"
              : "text-xs"
  }`;

  return <div className={className}>{children}</div>;
};

// Blockquote component
const BlockQuote = ({ children }: any) => {
  return (
    <blockquote className="pl-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 italic my-3">
      {children}
    </blockquote>
  );
};

const Link = ({ href, children }: any) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-default-300 p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  );
};

// Image component
const ImageComponent = ({ src, alt }: any) => {
  return (
    <div className="my-3">
      <img
        src={src}
        alt={alt || "Image"}
        className="rounded-md max-w-full max-h-[300px] object-contain"
      />
      {alt && <p className="text-xs text-center text-gray-500 mt-1">{alt}</p>}
    </div>
  );
};

// Horizontal rule
const HorizontalRule = () => {
  return <hr className="my-4 border-gray-300 dark:border-gray-600" />;
};

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
      <div className="relative group w-full max-w-full overflow-x-auto overflow-y-hidden">
        <pre className="p-4 rounded-md bg-black/80 backdrop-blur-md text-white overflow-x-auto overflow-y-hidden w-full text-sm">
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

// Custom table component for better markdown table formatting
const TableComponent = ({ children }: any) => {
  return (
    <div className="overflow-x-auto overflow-y-hidden w-full my-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-auto">
        {children}
      </table>
    </div>
  );
};

// Custom components for table headers and cells
const TableRow = ({ children }: any) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {children}
    </tr>
  );
};

const TableCell = ({ children, isHeader }: any) => {
  return isHeader ? (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
      {children}
    </th>
  ) : (
    <td className="px-4 py-3 text-sm">{children}</td>
  );
};

// Paragraph component
const Paragraph = ({ children, className = "" }: any) => {
  // Skip rendering if children is just whitespace or empty
  if (
    React.Children.count(children) === 0 ||
    (React.Children.count(children) === 1 &&
      typeof React.Children.toArray(children)[0] === "string" &&
      (React.Children.toArray(children)[0] as string).trim() === "")
  ) {
    return null;
  }
  return <p className={`my-1 ${className}`}>{children}</p>;
};

// List components for more compact rendering
const List = ({ ordered, children }: { ordered: boolean; children: any }) => {
  return ordered ? (
    <ol className="pl-5 my-1 list-decimal">{children}</ol>
  ) : (
    <ul className="pl-5 my-1 list-disc">{children}</ul>
  );
};

const ListItem = ({ children }: any) => {
  return <li className="my-0.5">{children}</li>;
};

const MarkdownComponents = {
  h1: ({ children }: any) => <Heading level={1}>{children}</Heading>,
  h2: ({ children }: any) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }: any) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }: any) => <Heading level={4}>{children}</Heading>,
  h5: ({ children }: any) => <Heading level={5}>{children}</Heading>,
  h6: ({ children }: any) => <Heading level={6}>{children}</Heading>,
  blockquote: BlockQuote,
  p: Paragraph,
  a: Link,
  img: ImageComponent,
  hr: HorizontalRule,
  code: CodeBlock,
  table: TableComponent,
  tr: TableRow,
  td: ({ children }: any) => <TableCell>{children}</TableCell>,
  th: ({ children }: any) => <TableCell isHeader>{children}</TableCell>,
  ul: ({ children }: any) => <List ordered={false}>{children}</List>,
  ol: ({ children }: any) => <List ordered={true}>{children}</List>,
  li: ListItem,
};

export function ChatBubble({
  isAssistant,
  content,
  isLoading,
  onRegenerate,
}: ChatBubbleProps) {
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    console.log("messageCopied", content);
  }, [content]);

  const copyMessageToClipboard = () => {
    navigator.clipboard.writeText(content);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  };

  return (
    <motion.div
      className="flex w-full p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-2 w-full max-w-full">
        <motion.div
          className={`flex flex-col gap-2 w-full ${
            isAssistant ? "items-start" : "items-end"
          }`}
        >
          {!isAssistant && (
            <Avatar
              src="https://ui-avatars.com/api/?name=T"
              size="sm"
              radius="full"
            />
          )}
          <div
            className={`flex flex-col gap-2 rounded-lg whitespace-pre-wrap break-words text-sm  ${
              isAssistant
                ? "max-w-[95%]"
                : "items-end bg-primary text-white shadow-md px-4 py-2 max-w-[95%] ml-auto"
            }`}
          >
            <div className="prose prose-sm dark:prose-invert w-full max-w-full overflow-x-auto overflow-y-hidden whitespace-pre-wrap markdown-content">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {content}
              </Markdown>
            </div>

            {isAssistant && !isLoading && (
              <div className="flex gap-2">
                <button
                  onClick={copyMessageToClipboard}
                  className="self-start mt-1 p-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
                  aria-label="Copy message"
                >
                  {messageCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                {
                  <button
                    onClick={onRegenerate}
                    className="self-start mt-1 p-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
                    aria-label="Regenerate message"
                  >
                    <RefreshCcw size={16} />
                  </button>
                }
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
