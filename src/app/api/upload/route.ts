import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "upload.png";

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // If Blob token is not configured locally yet, return mock URL for smooth local dev
    return NextResponse.json({
      url: `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80`,
      mock: true,
      message: "BLOB_READ_WRITE_TOKEN not set; using placeholder URL.",
    });
  }

  try {
    if (!request.body) {
      return NextResponse.json({ error: "Missing file body" }, { status: 400 });
    }

    const blob = await put(filename, request.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
