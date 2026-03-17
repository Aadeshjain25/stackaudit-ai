import { NextResponse } from "next/server";
import { auditRepository } from "../../../services/auditService";

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "Repository URL required" },
        { status: 400 }
      );
    }

    const result = await auditRepository(repoUrl);

    return NextResponse.json(result);

  } catch (error) {
    console.error("SCAN ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
