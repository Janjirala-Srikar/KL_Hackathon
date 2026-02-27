const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");
const pdf = require("pdf-poppler");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.extractFileData = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    let results = [];

    for (const file of req.files) {
      const filePath = file.path;
      const mimeType = file.mimetype;
      let extractedText = "";

      // ===============================
      // IMAGE OCR
      // ===============================
      if (mimeType.startsWith("image/")) {
        console.log("Processing image:", file.originalname);

        const result = await Tesseract.recognize(filePath, "eng");
        extractedText = result.data.text;
      }

      // ===============================
      // PDF OCR USING POPPLER
      // ===============================
      else if (mimeType === "application/pdf") {
        console.log("Processing PDF:", file.originalname);

        const outputDir = "./uploads";

        const opts = {
          format: "png",
          out_dir: outputDir,
          out_prefix: path.parse(file.originalname).name,
          page: null,
        };

        await pdf.convert(filePath, opts);

        const images = fs
          .readdirSync(outputDir)
          .filter(
            f =>
              f.startsWith(path.parse(file.originalname).name) &&
              f.endsWith(".png")
          );

        for (const img of images) {
          const imgPath = path.join(outputDir, img);

          const result = await Tesseract.recognize(imgPath, "eng");
          extractedText += result.data.text + "\n";

          fs.unlinkSync(imgPath);
        }
      }

      else {
        extractedText = "Unsupported file format";
      }

      // ===============================
      // CLEAN OCR TEXT (optional improvement)
      // ===============================
      extractedText = extractedText
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // ===============================
      // SEND TO GEMINI
      // ===============================
      const prompt = `
You are a medical data extraction and explanation assistant.

From the medical report text below:

1. Extract structured medical data.
2. Provide a detailed explanation in:
   - English (respectful tone, refer to user as "you")
   - Telugu (respectful tone)
   - Hindi (respectful tone)

Return STRICT JSON only in this format:

{
  "structured_data": {
    "patient_name": "",
    "age": "",
    "gender": "",
    "tests": [
      {
        "test_name": "",
        "value": "",
        "unit": "",
        "reference_range": ""
      }
    ]
  },
  "explanation": {
    "english": "",
    "telugu": "",
    "hindi": ""
  }
}

Medical Report Text:
${extractedText}
`;

      const response = await model.generateContent(prompt);
      const aiText = response.response.text();

      // Remove markdown formatting if present
      const cleanedAIText = aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsedResult;

      try {
        parsedResult = JSON.parse(cleanedAIText);
      } catch (err) {
        console.error("AI JSON Parse Error:", err);
        parsedResult = {
          structured_data: null,
          explanation: {
            english: "AI response parsing failed.",
            telugu: "AI సమాధానాన్ని విశ్లేషించడంలో సమస్య వచ్చింది.",
            hindi: "AI उत्तर को पार्स करने में समस्या आई।"
          },
          raw_ai_output: cleanedAIText
        };
      }

      results.push({
        fileName: file.originalname,
        structured_data: parsedResult.structured_data,
        explanation: parsedResult.explanation,
      });
    }

    res.json({
      message: "Files processed successfully",
      data: results,
    });

  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({ message: "Processing failed" });
  }
};