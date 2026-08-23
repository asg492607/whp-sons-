import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "whps-enterprise-jwt-secret-key-2026";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  scope: string;
  branchId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("whp_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function logAuditEvent(params: {
  userId?: string;
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  branchId?: string;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        module: params.module,
        entityType: params.entityType,
        entityId: params.entityId || null,
        oldValueJson: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValueJson: params.newValue ? JSON.stringify(params.newValue) : null,
        branchId: params.branchId || null
      }
    });
  } catch (err) {
    console.error("Audit logging error:", err);
  }
}