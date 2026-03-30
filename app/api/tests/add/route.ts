import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, modelName, date, score, risk, summary } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify if user exists first to provide better error
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json({ error: "User not found. Please re-register or login again." }, { status: 404 });
    }

    const test = await prisma.testResult.create({
      data: {
        userId,
        modelName,
        date,
        score,
        risk,
        summary,
      },
    });

    return NextResponse.json(test);
  } catch (error: any) {
    console.error("Add test error:", error?.message || error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || "Check server logs" 
    }, { status: 500 });
  }
}
