import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const reports = await prisma.reports.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Database error" },
      { status: 500 }
    );
  }
}