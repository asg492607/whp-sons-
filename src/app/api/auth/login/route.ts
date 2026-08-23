import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken, logAuditEvent } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const primaryRole = user.roles[0]?.role.slug || "internal-user";
    const scope = user.roles[0]?.role.scope || "BRANCH";
    const branchId = user.roles[0]?.branchId || null;

    const token = signToken({
      userId: user.id,
      email: user.email!,
      name: user.name,
      role: primaryRole,
      scope,
      branchId
    });

    await logAuditEvent({
      userId: user.id,
      action: "USER_LOGIN",
      module: "IDENTITY",
      entityType: "User",
      entityId: user.id
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryRole,
        scope,
        branchId
      }
    });

    response.cookies.set("whp_session", token, {
      httpOnly: true,
      path: "/",
      maxAge: 86400
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}