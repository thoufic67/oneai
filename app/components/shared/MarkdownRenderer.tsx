/**
 * @file app/components/shared/MarkdownRenderer.tsx
 * @description Shared markdown renderer using react-markdown, remark-gfm, and custom components. Use for chat, blog, changelog, etc.
 */
"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "@/app/components/chat-image";
import { Check, Copy } from "lucide-react";

// Heading components for different levels
const Heading = ({ level, children }: { level: number; children: any }) => {
  const className = `font-bold mb-2 mt-4 leading-tight ${
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

// Horizontal rule
const HorizontalRule = () => {
  return <hr className="my-4 border-gray-300 dark:border-gray-600" />;
};

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (children?.props?.children) {
      setCode(String(children.props.children).replace(/\n$/, ""));
    }
  }, [code, inline, match, children]);

  const copyToClipboard = () => {
    console.log("copyToClipboard", {
      code,
      inline,
      match,
      children: children,
      text: children.props.children,
    });
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && !match) {
    return (
      <div className="relative group w-full max-w-full overflow-x-auto overflow-y-hidden">
        <pre className="p-4 rounded-md bg-default-800 backdrop-blur-md text-default-900 overflow-x-auto overflow-y-hidden w-full text-sm text-default-100">
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
      className={`${className} bg-default-800 text-default-100 dark:bg-default-900 rounded`}
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
  return <p className={` ${className}`}>{children}</p>;
};

// List components for more compact rendering
const List = ({ ordered, children }: { ordered: boolean; children: any }) => {
  return ordered ? (
    <ol className="pl-5 my-1 list-decimal list-outside">{children}</ol>
  ) : (
    <ul className="pl-5 my-1 list-disc list-outside">{children}</ul>
  );
};

const ListItem = ({ children }: any) => {
  return (
    <li className="">
      <div className="mt-2">{children}</div>
    </li>
  );
};

// Image component
const ImageComponent = ({ src, alt }: any) => {
  return <Image src={src} alt={alt} />;
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
  pre: ({ children }: any) => CodeBlock({ children, inline: false }),
  code: ({ children }: any) => CodeBlock({ children, inline: true }),
  table: TableComponent,
  tr: TableRow,
  td: ({ children }: any) => <TableCell>{children}</TableCell>,
  th: ({ children }: any) => <TableCell isHeader>{children}</TableCell>,
  ul: ({ children }: any) => <List ordered={false}>{children}</List>,
  ol: ({ children }: any) => <List ordered={true}>{children}</List>,
  li: ListItem,
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none prose-img:rounded-lg prose-img:shadow mt-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
