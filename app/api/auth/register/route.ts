import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarInitials = (firstName[0] + lastName[0]).toUpperCase();

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatarInitials,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      },
    });

    // Remove password and ensure relations are initialized for new users
    const { password: _, ...userData } = user;
    return NextResponse.json({
      ...userData,
      testHistory: [],
      uploadedReports: [],
      posts: [],
      xp: 50,
      level: 1,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
