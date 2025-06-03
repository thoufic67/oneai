"use client";
/**
 * @file feature-highlights.tsx
 * @description Client component for the landing page feature highlights section. Uses Framer Motion and Lucide icons to display main features as cards. Occupies full device width and height.
 */
import { motion } from "framer-motion";
import {
  Sparkles,
  ImageIcon,
  FileUp,
  History,
  Share2,
  MessageSquare,
} from "lucide-react";
import { Card } from "@heroui/react";
import MultiModelChatDemo from "./feature-demos/MultiModelChatDemo";
import ImageGenerationDemo from "./feature-demos/ImageGenerationDemo";
import FileImageUploadDemo from "./feature-demos/FileImageUploadDemo";
import RevisionHistoryDemo from "./feature-demos/RevisionHistoryDemo";
import ShareableLinksDemo from "./feature-demos/ShareableLinksDemo";
import UnlimitedMessagingDemo from "./feature-demos/UnlimitedMessagingDemo";

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    title: "Multi-Model Chat",
    desc: "Chat with GPT-4, Gemini, Claude, and more in one place. Switch models per message.",
    Demo: MultiModelChatDemo,
  },
  {
    icon: <ImageIcon className="w-6 h-6 text-primary" />,
    title: "Image Generation",
    desc: "Generate images with DALL-E and more. Upload and share images in chat.",
    Demo: ImageGenerationDemo,
  },
  {
    icon: <FileUp className="w-6 h-6 text-primary" />,
    title: "File & Image Uploads",
    desc: "Attach images to messages, compressed and stored securely.",
    Demo: FileImageUploadDemo,
  },
  {
    icon: <History className="w-6 h-6 text-primary" />,
    title: "Revision History",
    desc: "Edit, regenerate, and browse full message history for every conversation.",
    Demo: RevisionHistoryDemo,
  },
  {
    icon: <Share2 className="w-6 h-6 text-primary" />,
    title: "Shareable Links",
    desc: "Create public, read-only links for any conversation. Secure and owner-controlled.",
    Demo: ShareableLinksDemo,
  },
  // {
  //   icon: <MessageSquare className="w-6 h-6 text-primary" />,
  //   title: "Unlimited Messaging",
  //   desc: "Fair usage policy applies. Enjoy seamless, real-time chat.",
  //   Demo: UnlimitedMessagingDemo,
  // },
];

export default function FeatureHighlights() {
  return (
    <section className=" w-full flex flex-col items-center justify-center py-16 px-4">
      <div className="flex flex-col items-center justify-center text-primary font-semibold text-xs rounded-full px-4 py-2 mb-8 shadow-sm bg-primary/10">
        Aiflo Features
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mx-auto">
        {features.map((feature, i) => {
          const Demo = feature.Demo;
          const cardColSpan = i === 0 ? "md:col-span-2" : "";
          return (
            <Card
              key={feature.title}
              className={`group flex flex-col items-center text-center bg-default-50/10 backdrop-blur-sm rounded-xl p-6 shadow-md border border-default-200 transition-colors duration-300 hover:bg-primary/10 hover:border-primary cursor-pointer ${cardColSpan}`}
            >
              <div className="transition-colors duration-300 group-hover:text-primary-700">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mt-3 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-default-600 text-xs mb-4 group-hover:text-primary-600 transition-colors duration-300">
                {feature.desc}
              </p>
              <div className="w-full flex-1 flex items-center justify-center  transition-opacity duration-300">
                <Demo />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
