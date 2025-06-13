import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.post("/api/uploads", upload.single("file"), (req, res) => {
  if (req.file) {
    const downloadUrl = `/files/${req.file.filename}`;
    res.json({
      message: "Файл загрузился!",
      fileId: req.file.filename,
      downloadUrl,
    });
  } else {
    res.status(400).json({ message: "Файл не загрузился" });
  }
});

app.use("/files/:filename", (req, res, next) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const now = new Date();
      fs.utimes(filePath, now, now, (err) => {
        if (err) console.error("Ошибка обновления времени файла:", err);
        next();
      });
    } else {
      next();
    }
  });
});


app.use("/files", express.static(UPLOAD_DIR));

const DELETE_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cleanupOldFiles() {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      console.error("Ошибка чтения папки uploads:", err);
      return;
    }
    const now = Date.now();
    files.forEach((file) => {
      const filePath = path.join(UPLOAD_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Ошибка stat файла:", file, err);
          return;
        }
        const age = now - stats.atimeMs;
        if (age > DELETE_AGE_MS) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Ошибка удаления файла:", file, err);
            } else {
              console.log(`Удалён устаревший файл: ${file}`);
            }
          });
        }
      });
    });
  });
}

setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Сервер слушает на http://localhost:${PORT}`);
});
