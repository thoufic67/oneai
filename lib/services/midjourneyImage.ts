/**
 * MidjourneyImageService (stub)
 * Service for generating images using Midjourney's API (future implementation).
 * Implements the ImageGenerationProvider interface for unified image generation.
 */
import {
  ImageGenerationProvider,
  ImageGenerationParams,
  ImageGenerationResult,
} from "@/types";

export class MidjourneyImageService implements ImageGenerationProvider {
  async generateImage(
    params: ImageGenerationParams
  ): Promise<ImageGenerationResult> {
    // TODO: Implement Midjourney API integration
    throw new Error("Midjourney image generation is not yet implemented");
  }
}
