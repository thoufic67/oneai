// @file page.tsx
// @description Blog page for Aiflo. Displays a modern grid of blog posts using HeroUI Card components. Includes an introductory post, features overview, and roadmap, with content sourced from PRD.md.
"use client";

import { Card } from "@heroui/react";
import { title } from "@/app/components/primitives";
import { Sparkles, Layers, Rocket } from "lucide-react";
import Link from "next/link";
import { blogPosts } from "../../types/blog";
import type { BlogPost } from "../../types/blog";

function getIcon(icon: BlogPost["icon"]): JSX.Element {
  switch (icon) {
    case "sparkles":
      return <Sparkles className="w-7 h-7 text-primary" />;
    case "layers":
      return <Layers className="w-7 h-7 text-primary" />;
    case "rocket":
      return <Rocket className="w-7 h-7 text-primary" />;
    default:
      return <Sparkles className="w-7 h-7 text-primary" />;
  }
}

export default function BlogPage() {
  return (
    <div className="w-full min-h-dvh max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 drop-shadow-lg">
        Aiflo Blog
      </h1>
      <p className="text-lg text-default-600 text-center max-w-2xl mb-10">
        Insights, updates, and news about Aiflo&apos;s unified AI platform.
        Explore features, product updates, and our vision for the future of AI
        accessibility.
      </p>
      <div className="w-full mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post: BlogPost) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="h-full group"
          >
            <Card className="flex flex-col h-full bg-white/30 dark:bg-default-50/30 backdrop-blur-2xl border border-white/30 dark:border-default-200/40 shadow-lg transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl">
              <div className="w-full h-40 bg-default-100 flex items-center justify-center overflow-hidden">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex-1 flex flex-col p-6">
                <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-default-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full border bg-white"
                  />
                  <span className="text-xs text-default-500">{post.date}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
