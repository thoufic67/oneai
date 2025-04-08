import { Avatar } from "@heroui/react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

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
            className={`flex flex-col gap-2 p-2 rounded-xl  whitespace-pre-wrap break-words text-sm ${
              isAssistant ? "" : "items-end bg-primary text-white shadow-md"
            } w-fit`}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
            {/* <AnimatePresence>
              {
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 flex justify-start"
                ></motion.div>
              }
            </AnimatePresence> */}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
