import { NextResponse } from "next/server";
import { getReportById, isValidReportId } from "@/src/services/reportService";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
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
    const { id } = await params;

    if (!isValidReportId(id)) {
      return errorResponse(404, "NOT_FOUND", "Report not found");
    }

    const report = await getReportById(id);

    if (!report) {
      return errorResponse(404, "NOT_FOUND", "Report not found");
    }

    return successResponse(report);
  } catch (error) {
    console.error("REPORT DETAIL API ERROR:", error);
    return errorResponse(500, "SERVER_ERROR", "Something went wrong");
  }
}
