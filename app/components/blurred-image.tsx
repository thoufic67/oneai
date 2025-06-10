"use client";

import { Image, ImageProps } from "@heroui/react";

export default function BlurredImage(props: ImageProps) {
  return <Image isBlurred {...props} />;
}
