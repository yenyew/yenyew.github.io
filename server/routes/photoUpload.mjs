import express from 'express';
import multer from 'multer';
import Photo from '../routes/photos.mjs'; // your schema file

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/', upload.single('photo'), async (req, res) => {  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const newPhoto = new Photo({ imageUrl: req.file.path });
    await newPhoto.save();

    res.status(200).json({ success: true, path: req.file.path });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

export default router;
