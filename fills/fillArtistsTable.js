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
const Artist = require('../models/Artist')(sequelize, DataTypes);
const sampleImages = ['t1.jpg', 't2.jpeg', 't3.png', 't4.jpg', 't5.png'];

async function fillArtistsTable(count) {
    try {
        await sequelize.sync();
        const genres = ['рок', 'поп', 'джаз', 'классика', 'хип-хоп', 'электроника', null];
        const countries = ['Россия', 'США', 'Великобритания', 'Франция', 'Германия', null];

        for (let i = 0; i < count; i++) {
            const artist = await Artist.create({
                name: faker.person.fullName(),
                bio: faker.lorem.paragraph(),
                country: faker.helpers.arrayElement(countries),
                genre: faker.helpers.arrayElement(genres),
                formed_year: faker.number.int({ min: 1960, max: 2025 }),
                is_active: faker.datatype.boolean(),
                label: faker.company.name(),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/artists', sampleImage);
            const destPath = path.join(__dirname, '../images/artists', sampleImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await artist.update({ photo: `/images/artists/${sampleImage}` });
            }

            console.log(`Исполнитель #${i + 1} успешно создан.`);
        }
        console.log(`${count} исполнителей успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании исполнителя:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}
fillArtistsTable(count);