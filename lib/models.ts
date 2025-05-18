// File: lib/models.ts
// Description: Stores all AI model definitions and provides helpers to retrieve them by type for use across the app.

export enum ModelVariant {
  Chat = "chat",
  Image = "image",
  Thinking = "thinking",
}

export type ModelType =
  | "openai/gpt-4.1"
  | "anthropic/claude-3.7-sonnet"
  | "mistralai/mistral-nemo"
  | "x-ai/grok-3-mini-beta"
  | "deepseek/deepseek-chat-v3-0324"
  | "deepseek/deepseek-r1-zero:free"
  | "perplexity/sonar"
  | "google/gemini-2.0-flash-001"
  | "meta-llama/llama-4-maverick"
  | "openai/gpt-image-1";

export interface Model {
  name: string;
  value: ModelType;
  logo: string;
  variant: ModelVariant;
}

const MODELS: Model[] = [
  {
    name: "Gemini",
    value: "google/gemini-2.0-flash-001",
    logo: "/logos/gemini.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "ChatGPT",
    value: "openai/gpt-4.1",
    logo: "/logos/openai.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "Claude",
    value: "anthropic/claude-3.7-sonnet",
    logo: "/logos/anthropic.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "Mistral",
    value: "mistralai/mistral-nemo",
    logo: "/logos/mistral.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "Grok",
    value: "x-ai/grok-3-mini-beta",
    logo: "/logos/grok.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "Perplexity",
    value: "perplexity/sonar",
    logo: "/logos/perplexity.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "DeepSeek",
    value: "deepseek/deepseek-chat-v3-0324",
    logo: "/logos/deepseek.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "Llama",
    value: "meta-llama/llama-4-maverick",
    logo: "/logos/llama.svg",
    variant: ModelVariant.Chat,
  },
  {
    name: "OpenAI Image",
    value: "openai/gpt-image-1",
    logo: "/logos/openai.svg",
    variant: ModelVariant.Image,
  },
  // {
  //   name: "DeepSeek-R1-Zero",
  //   value: "deepseek/deepseek-r1-zero:free",
  //   logo: "/logos/deepseek-r1.svg",
  //   variant: ModelVariant.Chat,
  // },
];

export function getModelsByVariant(variant: ModelVariant): Model[] {
  return MODELS.filter((model) => model.variant === variant);
}

export function getChatModels(): Model[] {
  return getModelsByVariant(ModelVariant.Chat);
}

export function getImageModels(): Model[] {
  return getModelsByVariant(ModelVariant.Image);
}

/**
 * Returns the model details for a given value, searching all models.
 * @param value The model value string.
 * @returns The Model object or undefined if not found.
 */
export function getModelByValue(value: string): Model | undefined {
  return MODELS.find((model) => model.value === value);
}
