import { NextResponse } from "next/server";
import { logFeedback } from "@/src/lib/analytics";
import { getPrisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reportId = Number(body?.reportId);
    const rating = body?.rating;
    const message = typeof body?.message === "string" ? body.message.trim() : null;

    if (!Number.isFinite(reportId) || (rating !== "yes" && rating !== "no")) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INPUT",
          message: "Invalid feedback payload.",
        },
        { status: 400 },
      );
    }

    const prisma = getPrisma();
    const report = await prisma.reports.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INPUT",
          message: "Report not found.",
        },
        { status: 404 },
      );
    }

    await prisma.feedback.create({
      data: {
        reportId,
        rating,
        message: message || null,
      },
    });

    logFeedback(reportId);

    return NextResponse.json({
      success: true,
      data: {
        reportId,
        saved: true,
      },
    });
  } catch (error) {
    console.error("FEEDBACK API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "FEEDBACK_FAILED",
        message: "Unable to save feedback.",
      },
      { status: 500 },
    );
  }
}
