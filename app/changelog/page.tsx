/**
 * @file app/changelog/page.tsx
 * @description Changelog page with timeline UI: date on the left, vertical line, and changelog card on the right. Renders markdown content and images. Uses HeroUI, Tailwind, Lucide, and react-markdown.
 */

"use client";

import { Card, CardHeader, CardBody, Image } from "@heroui/react";
import { changelogEntries } from "@/types/changelog";
import { Sparkles, Layers, Rocket } from "lucide-react";
import { useState } from "react";
import { MarkdownRenderer } from "@/app/components/shared/MarkdownRenderer";
import { Metadata } from "next";

const iconMap: Record<string, JSX.Element> = {
  sparkles: <Sparkles className="w-6 h-6 text-primary" />,
  layers: <Layers className="w-6 h-6 text-primary" />,
  rocket: <Rocket className="w-6 h-6 text-primary" />,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Changelog",
    description: "Track the latest updates and improvements to Aiflo.",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/changelog`,
    },
  };
}

export default function ChangelogPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  // Sort changelog entries by date descending
  const sortedEntries = [...changelogEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 h-full">
      <h1 className="text-3xl font-bold mb-12">Changelog</h1>
      <div className="relative flex flex-col gap-16 h-full">
        {/* Timeline vertical line */}
        <div className="absolute h-full left-8 top-0 bottom-0 w-0.5 bg-primary-200 z-0" />
        {sortedEntries.map((entry, idx) => (
          <div key={entry.id} className="relative flex items-start gap-8 z-10">
            {/* Date and dot */}
            <div className="flex flex-col items-center min-w-[80px] -ml-[10px]">
              <span className="text-xs text-primary-400 mb-2 whitespace-nowrap bg-default-100 rounded-full p-1">
                {new Date(entry.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span
                className={`w-5 h-5 rounded-full border-4 border-white bg-primary-500 shadow ${idx === 0 ? "ring-2 ring-primary-400" : ""}`}
              />
              {/* Spacer for timeline */}
              {idx !== sortedEntries.length - 1 && (
                <div className="flex-1 w-0.5 bg-primary-200" />
              )}
            </div>
            {/* Card */}
            <Card className="flex-1  bg-white/5 backdrop-blur-sm shadow-none hover:bg-white/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
                {entry.icon && iconMap[entry.icon]}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">
                    v{entry.version}
                  </span>
                  <span className="text-lg font-semibold">{entry.title}</span>
                </div>
              </CardHeader>
              <CardBody className="p-6 pt-2">
                <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4">
                  {entry.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                {/* Markdown content */}
                {entry.markdownContent && (
                  <MarkdownRenderer content={entry.markdownContent} />
                )}
                {/* Legacy details toggle (if present) */}
                {entry.details && (
                  <button
                    className="mt-4 text-primary underline text-sm"
                    onClick={() =>
                      setExpanded(expanded === entry.id ? null : entry.id)
                    }
                  >
                    {expanded === entry.id ? "Hide details" : "Show details"}
                  </button>
                )}
                {entry.details && expanded === entry.id && (
                  <div className="mt-2 text-gray-600 text-sm whitespace-pre-line">
                    {entry.details}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

// export async function generateMetadata() {
//   return {
//     title: "Changelog",
//     description: "Changelog for Aiflo",
//     openGraph: {
//       title: "Changelog",
//       description: "Changelog for Aiflo",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: "Changelog",
//       description: "Changelog for Aiflo",
//     },
//   };
// }
