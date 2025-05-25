/**
 * OpenAIImageService
 * Service for generating images using OpenAI's DALL-E API (gpt-image-1).
 * Implements the ImageGenerationProvider interface for unified image generation.
 * Now uses the official OpenAI SDK for all image requests.
 */
import {
  ImageGenerationProvider,
  ImageGenerationParams,
  ImageGenerationResult,
} from "@/types";
import { sampleOpenAIResponse } from "./sampleResponse";
import { uploadImageToBucket } from "@/lib/supabase/uploadImageToBucket";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import type { Response as OpenAIResponse } from "openai/resources/responses/responses";
import axios from "axios";

export class OpenAIImageService implements ImageGenerationProvider {
  /**
   * Generates an image using OpenAI's multi-turn image generation API.
   * Supports follow-up turns by passing previous_response_id.
   * Returns the response_id for chaining multi-turn requests.
   */
  async generateImage(
    params: ImageGenerationParams
  ): Promise<ImageGenerationResult & { response_id?: string }> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OpenAI API key");

      const openai = new OpenAI({ apiKey });

      // Multi-turn: Use response_id or previousImageResponseId for followup
      let previous_response_id = params.previous_response_id || undefined;
      console.log("previous_response_id", previous_response_id);

      // --- Attachment/multimodal logic with type enforcement and base64 conversion ---
      let input: any = params.prompt;
      if (Array.isArray(params.attachments) && params.attachments.length > 0) {
        // Type guard for attachment
        const isValidImageAttachment = (
          att: any
        ): att is { attachment_type: string; attachment_url: string } => {
          return (
            att &&
            typeof att === "object" &&
            att.attachment_type === "image" &&
            typeof att.attachment_url === "string" &&
            att.attachment_url.length > 0
          );
        };
        // Only include valid image attachments
        const imageAttachments = params.attachments.filter(
          isValidImageAttachment
        );
        if (imageAttachments.length > 0) {
          // Convert all attachments to base64 data URLs (if not already)
          const base64ImagePromises = imageAttachments.map(async (att) => {
            const dataUrl = await toBase64DataUrl(att.attachment_url);
            return {
              type: "input_image",
              image_url: dataUrl,
            };
          });
          const base64Images = await Promise.all(base64ImagePromises);
          // Official OpenAI syntax: input is an array with one object: { role: 'user', content: [...] }
          input = [
            {
              role: "user",
              content: [
                { type: "input_text", text: params.prompt },
                ...base64Images,
              ],
            },
          ];
        }
      }

      // Build request body for the responses API
      const request: any = {
        input,
        model: "gpt-4o-mini",
        user: params.user,
        previous_response_id: previous_response_id,
        tools: [
          {
            type: "image_generation",
            background: params.background || "auto",
            quality: "low",
            output_compression: 50,
            output_format: "webp",
            size: params.size || "auto",
          },
        ],
      };

      // Remove undefined/null fields
      Object.keys(request).forEach(
        (key) => request[key] === undefined && delete request[key]
      );

      // Use the SDK to call the responses endpoint
      const data: OpenAIResponse = await openai.responses.create(request);
      // const data = sampleOpenAIResponse;
      console.log(
        "Response from OpenAI image generation (SDK)",
        redactBase64InOpenAIResponse(data)
      );
      const result = await openAIImageToOpenRouterResponse(
        data,
        params.model,
        params.conversationId
      );
      // Attach response_id for multi-turn chaining
      return { ...result, response_id: data.id };
    } catch (error) {
      console.error("Error in OpenAIImageService.generateImage:", error);
      throw error;
    }
  }
}

/**
 * Converts an image URL (remote or local) to a base64-encoded data URL.
 * If the input is already a base64 data URL, returns it as-is.
 * @param url - The image URL to convert
 * @returns Promise<string> - The base64-encoded data URL
 */
export async function toBase64DataUrl(url: string): Promise<string> {
  // Helper to check if a string is a base64 data URL
  const isBase64DataUrl = (url: string) =>
    /^data:image\/(png|jpeg|jpg|webp);base64,/.test(url);
  if (isBase64DataUrl(url)) return url;
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const contentType = response.headers["content-type"] || "image/jpeg";
  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return `data:${contentType};base64,${base64}`;
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
  openAIResponse: OpenAIResponse,
  model: string,
  conversationId?: string
) {
  try {
    // Find the image generation call in the output array
    const imageCall = openAIResponse.output?.find(
      (item: any) => item.type === "image_generation_call"
    );
    const b64 = imageCall && "result" in imageCall ? imageCall.result : null;

    // Find the message with output_text for description
    const messageCall = openAIResponse.output?.find(
      (item: any) => item.type === "message"
    );
    const description =
      messageCall && "content" in messageCall
        ? (messageCall.content as any[]).find(
            (c: any) => c.type === "output_text"
          )?.text || ""
        : "";

    let previewMarkdown = "";
    let supabaseUrl = null;
    if (b64 && conversationId) {
      // Upload to Supabase and get the URL
      const id = uuidv4();
      const filePath = `conversationid/${conversationId}/${id}.webp`;
      const buffer = Buffer.from(b64, "base64");
      supabaseUrl = await uploadImageToBucket(buffer, filePath);
      previewMarkdown = `![Generated Image](${supabaseUrl})`;
    } else if (b64) {
      previewMarkdown = `![Generated Image](data:image/webp;base64,${b64})`;
    }
    if (description) {
      previewMarkdown += `\n\n${description}`;
    }

    return {
      id: `${openAIResponse.id || Date.now()}`,
      response_id: openAIResponse.id || null,
      choices: [
        {
          finish_reason: "stop",
          native_finish_reason: "stop",
          message: {
            role: "assistant",
            content: previewMarkdown,
            imageUrl: supabaseUrl || null,
            description: description || undefined,
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
  } catch (error) {
    console.error("Error in openAIImageToOpenRouterResponse:", error);
    throw error;
  }
}

function redactBase64InOpenAIResponse(data: any) {
  if (!data?.output) return data;
  return {
    ...data,
    output: data.output.map((item: any) => {
      if (item.type === "image_generation_call" && item.result) {
        return {
          ...item,
          result: `[base64 image, length: ${item.result.length}]`,
        };
      }
      return item;
    }),
  };
}
