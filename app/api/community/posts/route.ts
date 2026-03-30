import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    console.log("Prisma instance:", !!prisma);
    console.log("Prisma communityPost:", !!prisma.communityPost);

    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatarInitials: true,
          }
        }
      },
      take: 20
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
