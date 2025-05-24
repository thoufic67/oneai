// This file exports the Image component, which displays an image with the following features:
// - On click, the image expands into a HeroUI Modal with Framer Motion animation.
// - On modal close, the image animates back to its original position.
// - On hover, a download button (using Lucide Download icon and HeroUI Button) appears to download the image.
// - Uses TailwindCSS for styling, HeroUI for modal/button, Framer Motion for animation, and Lucide for icons.

"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Tooltip,
} from "@heroui/react";
import { Button } from "@heroui/button";
import { Download, X } from "lucide-react";
import { motion } from "framer-motion";

const Image = ({ src, alt }: { src: string; alt: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Download handler
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `${src}?download=aiflo-fgenerated-image.webp`;
    link.download = alt || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="relative inline-block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.img
        src={src}
        alt={alt || "Image"}
        className={`rounded-md max-w-full max-h-[300px] object-contain cursor-pointer transition-shadow group-hover:shadow-lg`}
        onClick={() => setIsOpen(true)}
        layoutId={`expandable-image-${src}`}
        whileHover={{ scale: 1.03 }}
      />
      {/* Download button on hover */}

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-2 right-2 z-10"
        >
          <Tooltip content="Download image">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="backdrop-blur-lg bg-white/50 hover:bg-white/30 shadow "
              onPress={handleDownload}
              aria-label="Download image"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </Button>
          </Tooltip>
        </motion.div>
      )}

      {alt && <p className="text-xs text-center text-gray-500 mt-1">{alt}</p>}
      {/* Modal for expanded image */}

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          backdrop="blur"
          hideCloseButton
          className="flex items-center justify-center shadow-none p-4"
        >
          <ModalContent className="bg-transparent overflow-visible">
            <ModalHeader className="w-full flex items-center justify-end py-4 px-0">
              <div className="flex items-center gap-4 sm:-mr-8">
                <Tooltip content="Download image">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-white/50"
                    onPress={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Close">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="default"
                    className="bg-white/50 "
                    onPress={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </ModalHeader>
            <ModalBody className="flex items-center justify-center p-0">
              <motion.img
                src={src}
                alt={alt || "Image"}
                className="rounded-lg min-w-[90dvw] max-w-[95dvw] sm:min-w-[50dvw] sm:max-w-[90dvw] sm:max-h-[90dvh] w-full object-contain "
                layoutId={`expandable-image-${src}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ cursor: "zoom-out" }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default Image;
export { Image };
