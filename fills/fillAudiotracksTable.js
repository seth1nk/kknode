const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker/locale/ru');
const path = require('path');
const fs = require('fs');
const sequelize = new Sequelize('postgresql://un7hhcsp8eufqzw40aay:mefouwZLLl1McTuIFMHltGmuavyGBm@bknz3zxtfq7sfrff4fbn-postgresql.services.clever-cloud.com:50013/bknz3zxtfq7sfrff4fbn', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
const Audiotrack = require('../models/Audiotrack')(sequelize, DataTypes);
const sampleImages = ['y1.png', 'y2.png', 'y3.jpg', 'y4.jpg', 'y5.jpg'];

async function fillAudiotracksTable(count) {
    try {
        await sequelize.sync();
        const genres = ['рок', 'поп', 'джаз', 'классика', 'хип-хоп', 'электроника', null];

        for (let i = 0; i < count; i++) {
            const audiotrack = await Audiotrack.create({
                title: faker.music.songName(),
                artist: faker.person.fullName(),
                album: faker.lorem.words(2),
                duration: faker.number.int({ min: 60, max: 600 }),
                genre: faker.helpers.arrayElement(genres),
                play_count: faker.number.int({ min: 0, max: 1000 }),
                release_year: faker.number.int({ min: 1960, max: 2025 }),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/audiotracks', sampleImage);
            const destPath = path.join(__dirname, '../images/audiotracks', sampleImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await audiotrack.update({ photo: `/images/audiotracks/${sampleImage}` });
            }

            console.log(`Аудиотрек #${i + 1} успешно создан.`);
        }
        console.log(`${count} аудиотреков успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании аудиотрека:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}
fillAudiotracksTable(count);