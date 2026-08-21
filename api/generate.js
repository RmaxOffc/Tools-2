import { generateIQC } from "iqc-canvas";

export default async function handler(req, res) {
  try {
    const { text, time = "09:45" } = req.query;

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        success: false,
        message: "Text tidak boleh kosong"
      });
    }

    const result = await generateIQC(
      String(text).trim(),
      String(time)
    );

    // Debug sementara kalau struktur package beda
    console.log("IQC result type:", typeof result);

    let imageBuffer;
    let mimeType = "image/png";

    if (Buffer.isBuffer(result)) {
      imageBuffer = result;
    } else if (result?.image) {
      imageBuffer = result.image;
      mimeType = result.mimeType || "image/png";
    } else if (result?.buffer) {
      imageBuffer = result.buffer;
      mimeType = result.mimeType || "image/png";
    } else if (result?.data) {
      imageBuffer = result.data;
      mimeType = result.mimeType || "image/png";
    }

    if (!imageBuffer) {
      throw new Error(
        "iqc-canvas tidak mengembalikan image buffer"
      );
    }

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error("IQC GENERATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal generate IQC",
      error: error.message
    });
  }
}
