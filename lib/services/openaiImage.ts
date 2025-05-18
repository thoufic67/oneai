/**
 * OpenAIImageService
 * Service for generating images using OpenAI's DALL-E API (gpt-image-1).
 * Implements the ImageGenerationProvider interface for unified image generation.
 */
import {
  ImageGenerationProvider,
  ImageGenerationParams,
  ImageGenerationResult,
} from "@/types";
import { sampleOpenAIResponse } from "./sampleResponse";
import { uploadImageToBucket } from "@/lib/supabase/uploadImageToBucket";
import { v4 as uuidv4 } from "uuid";

export class OpenAIImageService implements ImageGenerationProvider {
  async generateImage(
    params: ImageGenerationParams
  ): Promise<ImageGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OpenAI API key");

    const body = {
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || "1024x1024",
      user: params.user,
      model: params.model || "gpt-image-1",
      background: params.background || "auto",
      quality: "medium",
      output_compression: 50,
      output_format: "webp",
      // Add any other params as needed
    };

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI image generation failed");
    }

    const data = await response.json();
    // const data = sampleOpenAIResponse;
    console.log("Response from OpenAI image generation", data);
    return await openAIImageToOpenRouterResponse(
      data,
      params.model,
      params.conversationId
    );
  }
}

/**
 * Converts OpenAI image API response to OpenRouter response format.
 * The image is included as a README preview (markdown image link in content).
 *
 * @param openAIResponse - The raw response from OpenAI image API
 * @param model - The model name used for generation
 * @param conversationId - The conversation ID for bucket path (optional, required for b64 upload)
 * @returns OpenRouter-style response object
 */
export async function openAIImageToOpenRouterResponse(
  openAIResponse: any,
  model: string,
  conversationId?: string
) {
  const imageUrl = openAIResponse?.data?.[0]?.url || null;
  const b64 = openAIResponse?.data?.[0]?.b64_json || null;
  let previewMarkdown = "";
  let supabaseUrl = null;
  if (imageUrl) {
    previewMarkdown = `![Generated Image](${imageUrl})`;
  } else if (b64 && conversationId) {
    // Upload to Supabase and get the URL
    const id = uuidv4();
    const filePath = `conversationid/${conversationId}/${id}.webp`;
    const buffer = Buffer.from(b64, "base64");
    supabaseUrl = await uploadImageToBucket(buffer, filePath);
    previewMarkdown = `![Generated Image](${supabaseUrl})`;
  } else if (b64) {
    previewMarkdown = `![Generated Image](data:image/webp;base64,${b64})`;
  }

  return {
    id: `gen-${openAIResponse.created || Date.now()}`,
    choices: [
      {
        finish_reason: "stop",
        native_finish_reason: "stop",
        message: {
          role: "assistant",
          content: previewMarkdown,
          imageUrl: supabaseUrl || imageUrl || null,
        },
      },
    ],
    usage: {
      prompt_tokens: openAIResponse.usage?.input_tokens || 0,
      completion_tokens: openAIResponse.usage?.output_tokens || 0,
      total_tokens: openAIResponse.usage?.total_tokens || 0,
    },
    model,
  };
}
