export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = await req.formData();

    const file = formData.get("image");

    if (!file) {
      return res.status(400).json({ error: "No image" });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const body = new FormData();
    body.append("image", base64);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error("ImgBB upload failed");
    }

    return res.status(200).json({
      url: data.data.url,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
