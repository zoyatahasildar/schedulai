// app/api/settings/username/route.ts
// Username update API
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    // Validation
    if (!username || !username.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const clean = username.trim().toLowerCase();

    if (!/^[a-z0-9-_]+$/.test(clean)) {
      return NextResponse.json(
        { error: "Username can only contain lowercase letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    if (clean.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }

    if (clean.length > 30) {
      return NextResponse.json({ error: "Username must be 30 characters or less" }, { status: 400 });
    }

    // Check if username is already taken by someone else
    const existing = await prisma.user.findFirst({
      where: {
        username: clean,
        NOT: { id: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "This username is already taken" }, { status: 409 });
    }

    // Save username
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: clean },
      select: { id: true, username: true },
    });

    return NextResponse.json({ success: true, username: updated.username });
  } catch (error) {
    console.error("Username update error:", error);
    return NextResponse.json({ error: "Failed to save username" }, { status: 500 });
  }
}
