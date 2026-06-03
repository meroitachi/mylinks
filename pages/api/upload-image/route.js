import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { error: "No image" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const base64 = Buffer.from(bytes).toString("base64");

    const body = new FormData();

    body.append("image", base64);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body,
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error("ImgBB upload failed");
    }

    return NextResponse.json({
      url: data.data.url,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
