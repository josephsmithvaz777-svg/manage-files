const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const FILES_DIR = process.env.FILES_DIR || path.join(__dirname, 'files');
const BASE_URL = process.env.BASE_URL || 'https://www.amaim.lat';
const API_KEY = process.env.API_KEY || '';

// Ensure files directory exists
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, FILES_DIR),
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, safe);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// Middleware
app.use(express.json());

// Optional API Key auth middleware
function authMiddleware(req, res, next) {
    if (!API_KEY) return next();
    const key = req.headers['x-api-key'] || req.query.key;
    if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// Serve static files at /scripts/*
app.use('/scripts', express.static(FILES_DIR, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Serve frontend UI
app.use(express.static(path.join(__dirname, 'public')));

// API: List files
app.get('/api/files', authMiddleware, (req, res) => {
    try {
        const files = fs.readdirSync(FILES_DIR).map(name => {
            const stat = fs.statSync(path.join(FILES_DIR, name));
            return {
                name,
                size: stat.size,
                modified: stat.mtime,
                url: `${BASE_URL}/scripts/${name}`
            };
        });
        files.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Upload file(s)
app.post('/api/upload', authMiddleware, upload.array('files', 20), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    const uploaded = req.files.map(f => ({
        name: f.filename,
        size: f.size,
        url: `${BASE_URL}/scripts/${f.filename}`
    }));
    res.json({ success: true, files: uploaded });
});

// API: Delete file
app.delete('/api/files/:name', authMiddleware, (req, res) => {
    const name = req.params.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(FILES_DIR, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.unlinkSync(filePath);
    res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 File server running on port ${PORT}`);
    console.log(`📁 Files directory: ${FILES_DIR}`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
});
