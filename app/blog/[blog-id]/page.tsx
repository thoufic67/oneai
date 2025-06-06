// @file app/blog/[blog-id]/page.tsx
// @description Dynamic blog post page for Aiflo. Renders a blog post in markdown with title, author, image, tags, and a right-side ToC. Uses HeroUI, Tailwind, and react-markdown.

import { notFound } from "next/navigation";
import { blogPosts } from "../../../types/blog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import fs from "fs/promises";
import { MarkdownRenderer } from "@/app/components/shared/MarkdownRenderer";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ "blog-id": string }>;
}) {
  const { "blog-id": blogId } = await params;
  const post = blogPosts.find((p) => p.id === blogId);
  if (!post) return notFound();

  let content = post.content || "";
  if (post.mdPath) {
    try {
      content = await fs.readFile(post.mdPath, "utf8");
    } catch (e) {
      content = "Error loading blog content.";
    }
  }

  // Extract headings for ToC
  const headings = Array.from(content.matchAll(/^#+\s+(.+)$/gm)).map(
    (m) => m[1]
  );

  return (
    <div className="w-full flex flex-col min-h-screen lg:flex-row gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <Image
            src={post.image}
            alt={post.imageAlt}
            width={640}
            height={320}
            className="rounded-xl w-full h-56 object-contain bg-default-100 mb-4"
            priority
          />
          <div className="flex items-center gap-4 mb-2">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full border bg-white"
            />
            <div>
              <div className="font-semibold text-base">{post.author.name}</div>
              <div className="text-xs text-default-500">{post.author.role}</div>
            </div>
            <span className="ml-4 text-xs text-default-400">{post.date}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 mt-2 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-default-200 text-xs px-2 py-1 rounded-full text-default-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <article className="prose prose-neutral max-w-none dark:prose-invert text-base">
          <MarkdownRenderer content={content} />
        </article>
      </div>
      {/* ToC */}
      {headings.length > 0 && (
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 p-4 bg-default-50 border border-default-200 rounded-xl shadow-sm">
            <div className="font-semibold text-sm mb-2 text-default-700">
              On this page
            </div>
            <ul className="space-y-2 text-sm">
              {headings.map((h) => (
                <li key={h} className="text-default-600 truncate">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
