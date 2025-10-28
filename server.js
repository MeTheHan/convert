import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Video indirme endpoint'i
app.get('/download', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        const format = req.query.format || 'mp4';
        
        if (!videoUrl) {
            return res.status(400).json({ error: 'URL gerekli' });
        }

        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ error: 'Geçersiz YouTube URL' });
        }

        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        res.header({
            'Content-Disposition': `attachment; filename="${title}.${format}"`,
            'Content-Type': format === 'mp3' ? 'audio/mpeg' : 'video/mp4'
        });

        const quality = format === 'mp3' ? 'highestaudio' : 'highest';
        ytdl(videoUrl, { quality: quality })
            .pipe(res);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📹 YouTube Converter hazır!`);
});
