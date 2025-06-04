const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Audiotrack } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../images', 'audiotracks');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-audiotracks', authRequired, (req, res) => {
    res.redirect('/audiotracks/index.html');
});

router.get('/api/audiotracks', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Audiotrack.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'title', 'artist', 'album', 'duration', 'genre', 'play_count', 'release_year', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedAudiotracks = rows.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            album: item.album,
            duration: item.duration,
            genre: item.genre,
            play_count: item.play_count,
            release_year: item.release_year,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            audiotracks: formattedAudiotracks,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении аудиотреков:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-audiotrack/:id', authRequired, async (req, res) => {
    try {
        const audiotrack = await Audiotrack.findByPk(req.params.id, {
            attributes: ['id', 'title', 'artist', 'album', 'duration', 'genre', 'play_count', 'release_year', 'photo'],
        });
        if (!audiotrack) {
            return res.status(404).json({ error: 'Аудиотрек не найден' });
        }
        const formattedAudiotrack = {
            id: audiotrack.id,
            title: audiotrack.title,
            artist: audiotrack.artist,
            album: audiotrack.album,
            duration: audiotrack.duration,
            genre: audiotrack.genre,
            play_count: audiotrack.play_count,
            release_year: audiotrack.release_year,
            photo: audiotrack.photo ? audiotrack.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedAudiotrack);
    } catch (error) {
        console.error('Ошибка при получении аудиотрека:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/audiotracks', authRequired, async (req, res) => {
    try {
        const { title, artist, album, duration, genre, play_count, release_year, photo } = req.body;
        const audiotrack = await Audiotrack.create({
            title,
            artist,
            album,
            duration,
            genre,
            play_count,
            release_year,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedAudiotrack = {
            id: audiotrack.id,
            title: audiotrack.title,
            artist: audiotrack.artist,
            album: audiotrack.album,
            duration: audiotrack.duration,
            genre: audiotrack.genre,
            play_count: audiotrack.play_count,
            release_year: audiotrack.release_year,
            photo: audiotrack.photo,
        };
        res.status(201).json(formattedAudiotrack);
    } catch (error) {
        console.error('Ошибка при создании аудиотрека:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-audiotrack', authRequired, upload.single('photo'), async (req, res) => {
    let audiotrack;
    try {
        const requiredFields = ['title', 'artist', 'duration'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { title, artist, album, duration, genre, play_count, release_year } = req.body;
        audiotrack = await Audiotrack.create({
            title: title.trim(),
            artist: artist.trim(),
            album: album ? album.trim() : null,
            duration: parseInt(duration),
            genre: genre ? genre.trim() : null,
            play_count: parseInt(play_count) || 0,
            release_year: parseInt(release_year) || null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'audiotracks', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/audiotracks/${req.file.originalname}`;
            await audiotrack.update({ photo: photoPath });
        }

        res.redirect('/audiotracks/index.html');
    } catch (error) {
        console.error('Ошибка при создании аудиотрека:', error);
        if (audiotrack) await audiotrack.destroy();
        res.status(500).send(`Ошибка при создании аудиотрека: ${error.message}`);
    }
});

router.put('/api/audiotracks/:id', authRequired, async (req, res) => {
    try {
        const audiotrack = await Audiotrack.findByPk(req.params.id);
        if (!audiotrack) {
            return res.status(404).json({ error: 'Аудиотрек не найден' });
        }
        const { title, artist, album, duration, genre, play_count, release_year, photo } = req.body;
        await audiotrack.update({
            title,
            artist,
            album,
            duration,
            genre,
            play_count,
            release_year,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedAudiotrack = {
            id: audiotrack.id,
            title: audiotrack.title,
            artist: audiotrack.artist,
            album: audiotrack.album,
            duration: audiotrack.duration,
            genre: audiotrack.genre,
            play_count: audiotrack.play_count,
            release_year: audiotrack.release_year,
            photo: audiotrack.photo,
        };
        res.json(formattedAudiotrack);
    } catch (error) {
        console.error('Ошибка при обновлении аудиотрека:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-audiotrack/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const audiotrack = await Audiotrack.findByPk(req.params.id);
        if (!audiotrack) {
            return res.status(404).send('Аудиотрек не найден');
        }
        const { title, artist, album, duration, genre, play_count, release_year } = req.body;
        let photoPath = audiotrack.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'audiotracks', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/audiotracks/${req.file.originalname}`;
        }
        await audiotrack.update({
            title: title.trim(),
            artist: artist.trim(),
            album: album ? album.trim() : null,
            duration: parseInt(duration),
            genre: genre ? genre.trim() : null,
            play_count: parseInt(play_count) || 0,
            release_year: parseInt(release_year) || null,
            photo: photoPath,
        });
        res.redirect('/audiotracks/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении аудиотрека:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-audiotrack/:id', authRequired, async (req, res) => {
    try {
        const audiotrack = await Audiotrack.findByPk(req.params.id);
        if (!audiotrack) {
            return res.status(404).json({ error: 'Аудиотрек не найден' });
        }
        await audiotrack.destroy();
        res.json({ message: 'Аудиотрек удален' });
    } catch (error) {
        console.error('Ошибка при удалении аудиотрека:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;