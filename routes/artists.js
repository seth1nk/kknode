const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Artist } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../images', 'artists');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-artists', authRequired, (req, res) => {
    res.redirect('/artists/index.html');
});

router.get('/api/artists', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Artist.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'name', 'bio', 'country', 'genre', 'formed_year', 'is_active', 'label', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedArtists = rows.map(item => ({
            id: item.id,
            name: item.name,
            bio: item.bio,
            country: item.country,
            genre: item.genre,
            formed_year: item.formed_year,
            is_active: item.is_active,
            label: item.label,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            artists: formattedArtists,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении исполнителей:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-artist/:id', authRequired, async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id, {
            attributes: ['id', 'name', 'bio', 'country', 'genre', 'formed_year', 'is_active', 'label', 'photo'],
        });
        if (!artist) {
            return res.status(404).json({ error: 'Исполнитель не найден' });
        }
        const formattedArtist = {
            id: artist.id,
            name: artist.name,
            bio: artist.bio,
            country: artist.country,
            genre: artist.genre,
            formed_year: artist.formed_year,
            is_active: artist.is_active,
            label: artist.label,
            photo: artist.photo ? artist.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedArtist);
    } catch (error) {
        console.error('Ошибка при получении исполнителя:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/artists', authRequired, async (req, res) => {
    try {
        const { name, bio, country, genre, formed_year, is_active, label, photo } = req.body;
        const artist = await Artist.create({
            name,
            bio,
            country,
            genre,
            formed_year,
            is_active,
            label,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedArtist = {
            id: artist.id,
            name: artist.name,
            bio: artist.bio,
            country: artist.country,
            genre: artist.genre,
            formed_year: artist.formed_year,
            is_active: artist.is_active,
            label: artist.label,
            photo: artist.photo,
        };
        res.status(201).json(formattedArtist);
    } catch (error) {
        console.error('Ошибка при создании исполнителя:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-artist', authRequired, upload.single('photo'), async (req, res) => {
    let artist;
    try {
        const requiredFields = ['name'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { name, bio, country, genre, formed_year, is_active, label } = req.body;
        artist = await Artist.create({
            name: name.trim(),
            bio: bio ? bio.trim() : null,
            country: country ? country.trim() : null,
            genre: genre ? genre.trim() : null,
            formed_year: parseInt(formed_year) || null,
            is_active: is_active === 'true' || is_active === true,
            label: label ? label.trim() : null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'artists', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/artists/${req.file.originalname}`;
            await artist.update({ photo: photoPath });
        }

        res.redirect('/artists/index.html');
    } catch (error) {
        console.error('Ошибка при создании исполнителя:', error);
        if (artist) await artist.destroy();
        res.status(500).send(`Ошибка при создании исполнителя: ${error.message}`);
    }
});

router.put('/api/artists/:id', authRequired, async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ error: 'Исполнитель не найден' });
        }
        const { name, bio, country, genre, formed_year, is_active, label, photo } = req.body;
        await artist.update({
            name,
            bio,
            country,
            genre,
            formed_year,
            is_active,
            label,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedArtist = {
            id: artist.id,
            name: artist.name,
            bio: artist.bio,
            country: artist.country,
            genre: artist.genre,
            formed_year: artist.formed_year,
            is_active: artist.is_active,
            label: artist.label,
            photo: artist.photo,
        };
        res.json(formattedArtist);
    } catch (error) {
        console.error('Ошибка при обновлении исполнителя:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-artist/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).send('Исполнитель не найден');
        }
        const { name, bio, country, genre, formed_year, is_active, label } = req.body;
        let photoPath = artist.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'artists', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/artists/${req.file.originalname}`;
        }
        await artist.update({
            name: name.trim(),
            bio: bio ? bio.trim() : null,
            country: country ? country.trim() : null,
            genre: genre ? genre.trim() : null,
            formed_year: parseInt(formed_year) || null,
            is_active: is_active === 'true' || is_active === true,
            label: label ? label.trim() : null,
            photo: photoPath,
        });
        res.redirect('/artists/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении исполнителя:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-artist/:id', authRequired, async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ error: 'Исполнитель не найден' });
        }
        await artist.destroy();
        res.json({ message: 'Исполнитель удален' });
    } catch (error) {
        console.error('Ошибка при удалении исполнителя:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;