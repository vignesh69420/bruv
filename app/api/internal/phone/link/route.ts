import { phoneLinkQuerySchema } from "@/lib/schemas/phone";
import { getPhoneLinkByPhoneNumber } from "@/lib/server/phone-links";
import { requireInternalRequest } from "@/lib/server/internal-api";
import { errorResponse, queryParams } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    requireInternalRequest(request);
    const { phoneNumber } = phoneLinkQuerySchema.parse(queryParams(request));
    const link = await getPhoneLinkByPhoneNumber(phoneNumber);
    return Response.json({ link: link ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}
