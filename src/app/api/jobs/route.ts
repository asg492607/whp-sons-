import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "PUBLISHED", isPublic: true, isDeleted: false },
      include: {
        branch: true,
        department: true,
        designation: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, applicantName, email, phone, experienceYears, currentCtc, expectedCtc, coverLetter } = body;

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantName,
        email,
        phone,
        experienceYears: parseFloat(experienceYears || 0),
        currentCtc: parseFloat(currentCtc || 0),
        expectedCtc: parseFloat(expectedCtc || 0),
        coverLetter,
        status: "APPLIED",
        appliedVia: "WEBSITE"
      }
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}