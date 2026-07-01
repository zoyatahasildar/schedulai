import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true },
    });

    const connectedProviders = accounts.map((acc) => acc.provider.toLowerCase());

    return NextResponse.json({ success: true, connected: connectedProviders });
  } catch (error) {
    console.error("Fetch integrations error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch integrations" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider is required" }, { status: 400 });
    }

    const providerLower = provider.toLowerCase();

    // Prevent disconnecting Google since it is the primary login provider to prevent lockout
    if (providerLower === "google") {
      return NextResponse.json(
        { success: false, error: "Cannot disconnect primary login account (Google)." },
        { status: 400 }
      );
    }

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: providerLower,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect integration error:", error);
    return NextResponse.json({ success: false, error: "Failed to disconnect integration" }, { status: 500 });
  }
}
