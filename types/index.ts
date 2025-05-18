import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Image generation types and provider interface
export interface ImageGenerationParams {
  prompt: string;
  n?: number; // number of images
  size?: string; // e.g., '1024x1024'
  user?: string;
  [key: string]: any; // for provider-specific params
}

export interface ImageGenerationResult {
  id: string;
  choices: Array<{
    finish_reason: string;
    native_finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface ImageGenerationProvider {
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}
