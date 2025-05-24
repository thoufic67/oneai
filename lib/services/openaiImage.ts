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

      // Build request body for the responses API
      const request: any = {
        input: params.prompt,
        model: "gpt-4o",
        user: params.user,
        previous_response_id: previous_response_id,
        tools: [
          {
            type: "image_generation",
            background: params.background || "auto",
            quality: "auto",
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
      console.log("Response from OpenAI image generation (SDK)", data);
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

  /**
   * Streams image generation using OpenAI's API, yielding partial images/events as they arrive.
   * @param params ImageGenerationParams
   * @param onEvent Callback for each event (partial image, progress, final image)
   */
  async generateImageStream(
    params: ImageGenerationParams,
    onEvent: (event: any) => Promise<void> | void
  ): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OpenAI API key");
    const openai = new OpenAI({ apiKey });

    let previous_response_id = params.previous_response_id || undefined;
    const request: any = {
      input: params.prompt,
      model: "gpt-4o",
      user: params.user,
      previous_response_id: previous_response_id,
      stream: true,
      tools: [
        {
          type: "image_generation",
          background: params.background || "auto",
          quality: "auto",
          output_compression: 50,
          output_format: "webp",
          size: params.size || "auto",
          partial_images: 1, // Request partial images
        },
      ],
    };
    Object.keys(request).forEach(
      (key) => request[key] === undefined && delete request[key]
    );

    // Stream events from OpenAI
    const stream = await openai.responses.create(request);
    let finalResponse: OpenAIResponse | null = null;
    for await (const event of stream as any) {
      // Partial image event
      if (event.type === "response.image_generation_call.partial_image") {
        console.log("Partial image event", event);
        const idx = event.partial_image_index;
        const imageBase64 = event.partial_image_b64;
        let imageUrl = null;
        if (imageBase64 && params.conversationId) {
          // Upload to Supabase
          const id = uuidv4();
          const filePath = `conversationid/${params.conversationId}/partial_${idx}.webp`;
          const buffer = Buffer.from(imageBase64, "base64");
          imageUrl = await uploadImageToBucket(buffer, filePath);
        }
        await onEvent({
          type: "partial_image",
          index: idx,
          imageUrl: imageUrl
            ? imageUrl
            : `data:image/webp;base64,${imageBase64}`,
        });
      }
      // Final response event (per OpenAI docs)
      else if (event.type === "response") {
        console.log("Final response event", event);
        finalResponse = event;
        // Convert to OpenRouter format
        const result = await openAIImageToOpenRouterResponse(
          event,
          params.model,
          params.conversationId
        );
        await onEvent({
          type: "final_image",
          ...result,
        });
      }
      // Optionally handle completed event for progress
      else if (event.type === "response.image_generation_call.completed") {
        // (Optional: can be used for progress, but not for the final image)
      }
    }
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
