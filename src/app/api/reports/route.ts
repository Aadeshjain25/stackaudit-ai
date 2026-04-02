import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "DISABLED",
      message: "Listing reports is not available",
    },
    { status: 403 },
  );
}
