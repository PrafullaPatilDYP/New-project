const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware to parse form-data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use("/files", express.static("uploads"));

// Serve PDFs directory
app.use("/pdfs", express.static("pdfs"));

// Serve previous papers directory
app.use("/previous-papers", express.static("previous-papers"));

// Serve previous papers files directly
app.get("/papers/:year/:paper", (req, res) => {
    const { year, paper } = req.params;
    const filePath = path.join("previous-papers", `${year}_${paper}.pdf`);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('Paper not found');
    }
});

// Create pdfs directory if it doesn't exist
if (!fs.existsSync("pdfs")) {
  fs.mkdirSync("pdfs", { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const subject = req.body.subject;
    const dir = path.join("uploads", subject);

    // If the folder doesn't exist, create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  },
});

const upload = multer({ storage: storage });

// Upload route
app.post("/upload", upload.single("pdf"), (req, res) => {
  const subject = req.body.subject;
  const filename = req.file.filename;
  const filePath = `/files/${subject}/${filename}`;
  res.send(`PDF uploaded successfully. Download link: ${filePath}`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});