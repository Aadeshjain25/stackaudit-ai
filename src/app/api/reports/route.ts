import { NextResponse } from "next/server";
import { listReports } from "@/src/services/reportService";

export async function GET() {
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
    const reports = await listReports();
    return successResponse(reports);
  } catch (error) {
    console.error("REPORTS API ERROR:", error);
    return errorResponse(500, "SERVER_ERROR", "Something went wrong");
  }
}
