import { defineTool } from "eve/tools";
import { z } from "zod";
import { generateImage } from "ai";
import { gateway } from "@ai-sdk/gateway";

// Generates an image via the Vercel AI Gateway. The full image (base64) is
// returned for the UI to render, but toModelOutput keeps it out of the model's
// context (it only needs to know an image was made).
export default defineTool({
  description:
    "Generate an image from a text prompt. Use when the user asks to create, make, draw, or generate an image, meme, logo, or picture. Describe the scene richly in the prompt.",
  inputSchema: z.object({
    prompt: z
      .string()
      .min(1)
      .describe("Detailed description of the image to generate"),
  }),
  async execute({ prompt }) {
    const { image } = await generateImage({
      model: gateway.imageModel("bfl/flux-pro-1.1"),
      prompt,
    });
    return {
      prompt,
      dataUrl: `data:${image.mediaType ?? "image/png"};base64,${image.base64}`,
    };
  },
  toModelOutput(output) {
    return {
      type: "text",
      value: `Generated an image for: "${output.prompt}". It is now shown to the user.`,
    };
  },
});
