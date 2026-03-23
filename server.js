const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 🔥 Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// 🔥 File filter (security)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// 🔥 Upload API
app.post("/upload", upload.single("image"), (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        console.log("✅ Uploaded:", fileUrl);

        res.send(fileUrl);

    } catch (err) {
        console.error("❌ Upload error:", err);
        res.status(500).send("Upload failed");
    }
});

// 🔥 Serve images
app.use("/uploads", express.static(uploadDir));

// 🔥 Health check (Render needs this)
app.get("/", (req, res) => {
    res.send("KYC Server Running 🚀");
});

// 🔥 PORT for Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});