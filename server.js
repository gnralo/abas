import express from "express";
import fetch from "node-fetch";
import { URL } from "url";

const app = express();
const TARGET = "https://sharkiptvpro.pro"; // الموقع الأصلي اللي بتخفيه

// ✅ إعادة توجيه كل المسارات إلى الموقع الأصلي
app.use(async (req, res) => {
  try {
    const targetUrl = new URL(req.originalUrl, TARGET).toString();
    console.log("➡️ Fetching:", targetUrl);

    // جلب المحتوى من الموقع الأصلي
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).filter(([k]) => !["host"].includes(k))
        ),
      },
    });

    // الحصول على نوع المحتوى
    const contentType = response.headers.get("content-type");
    res.setHeader("content-type", contentType || "text/plain");

    // لو المحتوى HTML نبدّل الدومين داخله
    if (contentType && contentType.includes("text/html")) {
      let html = await response.text();

      // استبدال كل الروابط بالدومين الجديد
      html = html.replaceAll(TARGET, `https://algnral.app.tc`);
      res.send(html);
    } else {
      // إرسال الملفات كما هي (صور، CSS، JS...)
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Proxy Error: " + err.message);
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
