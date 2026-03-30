import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const LEVEL_XP_REQUIREMENT = 100;

export async function POST(req: Request) {
  try {
    const { userId, activityId, xpGain } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Record progress
    await prisma.activityProgress.create({
      data: {
        userId,
        activityId
      }
    });

    // Update User XP & Level
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let newXp = user.xp + xpGain;
    let newLevel = user.level;

    // Level up logic
    while (newXp >= (newLevel * LEVEL_XP_REQUIREMENT)) {
      newXp -= (newLevel * LEVEL_XP_REQUIREMENT);
      newLevel += 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel
      }
    });

    // Remove password
    const { password: _, ...safeUser } = updatedUser;
    
    return NextResponse.json({ success: true, updatedUser: safeUser });
  } catch (error) {
    console.error("Complete activity error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
