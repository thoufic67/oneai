// @file app/blog/[blog-id]/page.tsx
// @description Dynamic blog post page for Aiflo. Renders a blog post from an MDX file with title, author, image, tags, and a right-side ToC. Uses HeroUI, Tailwind, and Next.js MDX support.

import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Image from "next/image";
import React from "react";
import { BlogPost, blogPosts } from "@/types/blog";
import { MarkdownRenderer } from "@/app/components/shared/MarkdownRenderer";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ "blog-id": string }>;
}) {
  const { "blog-id": blogId } = await params;

  console.log("blogPosts", blogPosts);
  // Find the blog post by id
  const post = blogPosts.find((p) => p.id === blogId);
  if (!post) {
    return notFound();
  }
  // The MDX component is imported in blogPosts for certain posts
  // We'll use the content property if it's a function/component
  let MDXContent: JSX.Element | null = null;
  // if (post.content && typeof post.content === "function") {
  //   MDXContent = post.content as unknown as JSX.Element;
  // }

  // Extract headings for ToC (if possible)
  // If MDXContent is available, we can't easily extract headings from the component
  // So we fallback to an empty ToC or use static headings if needed
  const headings: string[] = [];

  return (
    <div className="w-full flex flex-col min-h-screen lg:flex-row gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          {post?.image && (
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              width={640}
              height={320}
              className="rounded-xl w-full h-56 object-contain bg-default-100 mb-4"
              priority
            />
          )}
          <div className="flex items-center gap-4 mb-2">
            {post?.author?.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full border bg-white"
              />
            )}
            <div>
              <div className="font-semibold text-base">
                {post?.author?.name}
              </div>
              <div className="text-xs text-default-500">
                {post?.author?.role}
              </div>
            </div>
            <span className="ml-4 text-xs text-default-400">{post?.date}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 mt-2 leading-tight">
            {post?.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(post.tags) &&
              post.tags.map((tag: string) => (
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
          {/* Render MDX content as a component if available, else fallback to string */}
          {post.content && <MarkdownRenderer content={post.content} />}
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
