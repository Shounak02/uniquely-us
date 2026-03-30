import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { authorId, type, content, caption } = await req.json();

    if (!authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId,
        type,
        content,
        caption,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      },
    });

    // Award sharing XP
    await prisma.user.update({
      where: { id: authorId },
      data: { xp: { increment: 25 } }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Share post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
