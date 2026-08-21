const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve folder public
app.use(express.static(path.join(__dirname, "public")));

// Endpoint generate
app.get("/generate", async (req, res) => {
  try {
    const text = String(req.query.text || "").trim();
    const time = String(req.query.time || "09:45").trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text tidak boleh kosong"
      });
    }

    // Import iqc-canvas
    const iqc = await import("iqc-canvas");

    // Cari fungsi generator dari package
    const generateIQC =
      iqc.generateIQC ||
      iqc.default?.generateIQC ||
      iqc.default;

    if (typeof generateIQC !== "function") {
      throw new Error(
        "generateIQC tidak ditemukan. Cek versi package iqc-canvas."
      );
    }

    // Generate canvas/image
    const result = await generateIQC(text, time);

    /*
      Package bisa mengembalikan Buffer langsung
      atau object seperti:
      {
        image: Buffer,
        mimeType: "image/png"
      }
    */

    const imageBuffer =
      Buffer.isBuffer(result)
        ? result
        : result?.image || result?.buffer || result?.data;

    if (!imageBuffer) {
      console.log("Result iqc-canvas:", result);

      throw new Error(
        "iqc-canvas tidak mengembalikan image buffer"
      );
    }

    const mimeType =
      result?.mimeType ||
      result?.type ||
      "image/png";

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      'inline; filename="rmax-visual.png"'
    );

    // Anti cache biar regenerate gambar baru
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    return res.send(imageBuffer);

  } catch (error) {
    console.error("GENERATE ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal generate visual",
      error: error.message
    });
  }
});

// Fallback ke index.html
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("=================================");
  console.log(" RMAX VISUAL GENERATOR RUNNING");
  console.log("=================================");
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Port: ${PORT}`);
  console.log("=================================");
});
