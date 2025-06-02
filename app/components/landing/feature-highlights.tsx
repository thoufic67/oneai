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

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    title: "Multi-Model Chat",
    desc: "Chat with GPT-4, Gemini, Claude, and more in one place. Switch models per message.",
  },
  {
    icon: <ImageIcon className="w-6 h-6 text-primary" />,
    title: "Image Generation",
    desc: "Generate images with DALL-E and more. Upload and share images in chat.",
  },
  {
    icon: <FileUp className="w-6 h-6 text-primary" />,
    title: "File & Image Uploads",
    desc: "Attach images to messages, compressed and stored securely.",
  },
  {
    icon: <History className="w-6 h-6 text-primary" />,
    title: "Revision History",
    desc: "Edit, regenerate, and browse full message history for every conversation.",
  },
  {
    icon: <Share2 className="w-6 h-6 text-primary" />,
    title: "Shareable Links",
    desc: "Create public, read-only links for any conversation. Secure and owner-controlled.",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
    title: "Unlimited Messaging",
    desc: "Fair usage policy applies. Enjoy seamless, real-time chat.",
  },
];

export default function FeatureHighlights() {
  return (
    <section className="min-h-screen w-full flex flex-col gap-8 items-center justify-center animate-blur-in-up">
      <div className="flex flex-col items-center justify-center text-primary font-semibold text-xs rounded-full px-4 py-2 mb-2 shadow-sm bg-primary/10">
        Aiflo Features
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center bg-default-50 rounded-xl p-6 shadow-md border border-default-200"
          >
            {feature.icon}
            <h3 className="font-semibold text-lg mt-3 mb-1">{feature.title}</h3>
            <p className="text-default-600 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
