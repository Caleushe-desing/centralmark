import { NextResponse } from "next/server";
import { StoreAiRateLimitError } from "./store-ai-limiter";

export function aiRateLimitResponse(error: StoreAiRateLimitError): NextResponse {
  return NextResponse.json(
    { error: error.message, code: "STORE_RATE_LIMIT", tier: error.tier },
    {
      status: 429,
      headers: { "Retry-After": String(error.retryAfterSeconds) },
    }
  );
}
