import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, fileName, uploadedDate, type, status } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists (important when changing DB providers)
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json({ error: "User session not found on this database. Please re-login." }, { status: 404 });
    }

    const report = await prisma.uploadedReport.create({
      data: {
        userId,
        fileName,
        uploadedDate,
        type,
        status,
      },
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Add report error:", error?.message || error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error?.message || "Check server logs"
    }, { status: 500 });
  }
}
