/**
 * @file app/components/shared/MarkdownRenderer.tsx
 * @description Shared markdown renderer using react-markdown, remark-gfm, and custom components. Use for chat, blog, changelog, etc.
 */
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "@/app/components/chat-image";

// Import all custom components from ChatBubble
// (Copying the relevant code for self-containment)
const Heading = ({ level, children }: { level: number; children: any }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={`mt-6 mb-2 font-bold `}>{children}</Tag>;
};
const BlockQuote = ({ children }: any) => (
  <blockquote className="border-l-4 border-primary-300 pl-4 italic text-gray-600 my-4">
    {children}
  </blockquote>
);
const Link = ({ href, children }: any) => (
  <a
    href={href}
    className="text-primary underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);
const HorizontalRule = () => <hr className="my-6 border-primary-200" />;
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  return inline ? (
    <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-primary-700">
      {children}
    </code>
  ) : (
    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto my-4">
      <code>{children}</code>
    </pre>
  );
};
const TableComponent = ({ children }: any) => (
  <table className="min-w-full border-collapse my-4">{children}</table>
);
const TableRow = ({ children }: any) => (
  <tr className="border-b border-primary-100">{children}</tr>
);
const TableCell = ({ children, isHeader }: any) => {
  const Tag = isHeader ? "th" : "td";
  return <Tag className="px-4 py-2 text-left align-top">{children}</Tag>;
};
const Paragraph = ({ children, className = "" }: any) => {
  if (
    !children ||
    (Array.isArray(children) && children.length === 0) ||
    (React.Children.count(children) === 1 &&
      typeof React.Children.toArray(children)[0] === "string" &&
      (React.Children.toArray(children)[0] as string).trim() === "")
  ) {
    return null;
  }
  return <p className={`my-3 leading-relaxed ${className}`}>{children}</p>;
};
const List = ({ ordered, children }: { ordered: boolean; children: any }) => {
  return ordered ? (
    <ol className="pl-5 my-2 list-decimal list-outside">{children}</ol>
  ) : (
    <ul className="pl-5 my-2 list-disc list-outside">{children}</ul>
  );
};
const ListItem = ({ children }: any) => (
  <li className="mb-2">
    <div>{children}</div>
  </li>
);
// Image component
const ImageComponent = ({ src, alt }: any) => {
  return <Image src={src} alt={alt} />;
};

export const MarkdownComponents = {
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
