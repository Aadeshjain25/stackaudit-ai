import { NextResponse } from "next/server";
import { logScan } from "@/src/lib/analytics";
import { consumeRateLimit, getRequestIp } from "@/src/lib/rateLimiter";
import {
  CloneTimeoutError,
  RepoTooLargeError,
  runAudit,
  UnsupportedRepoError,
} from "@/src/services/auditService";

export async function POST(req: Request) {
  function successResponse<T>(data: T) {
    return NextResponse.json({
      success: true,
      data,
    });
  }

  function errorResponse(status: number, error: string, message: string) {
    return NextResponse.json(
      {
        success: false,
        error,
        message,
      },
      { status },
    );
  }

  try {
    let body: { repoUrl?: unknown };

    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "INVALID_INPUT", "Invalid request body.");
    }

    const { repoUrl } = body;
    const rateLimit = consumeRateLimit(getRequestIp(req));

    if (!rateLimit.allowed) {
      return errorResponse(429, "RATE_LIMITED", "Too many scans. Please wait a minute.");
    }

    if (!repoUrl || typeof repoUrl !== "string") {
      return errorResponse(400, "INVALID_INPUT", "Repository URL required.");
    }

    logScan(repoUrl);

    const result = await runAudit(repoUrl);

    return successResponse(result);
  } catch (error) {
    console.error("SCAN ERROR:", error);

    if (error instanceof UnsupportedRepoError) {
      return errorResponse(422, "UNSUPPORTED_REPO", error.message);
    }

    if (error instanceof RepoTooLargeError) {
      return errorResponse(422, "REPO_TOO_LARGE", error.message);
    }

    if (error instanceof CloneTimeoutError) {
      return errorResponse(422, "CLONE_TIMEOUT", error.message);
    }

    return errorResponse(500, "SCAN_FAILED", "Something went wrong during analysis.");
  }
}
