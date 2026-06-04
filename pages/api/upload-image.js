import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const form = formidable({});

    const [fields, files] = await form.parse(req);

    const image = files.image?.[0];

    if (!image) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    const fileBuffer = fs.readFileSync(
      image.filepath
    );

    const base64 = fileBuffer.toString(
      "base64"
    );

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
      return res.status(500).json(data);
    }

    return res.status(200).json({
      url: data.data.url,
      deleteUrl: data.data.delete_url,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
}
