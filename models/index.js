const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://un7hhcsp8eufqzw40aay:mefouwZLLl1McTuIFMHltGmuavyGBm@bknz3zxtfq7sfrff4fbn-postgresql.services.clever-cloud.com:50013/bknz3zxtfq7sfrff4fbn', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        timestamps: true,
        underscored: true,
    }
});

const User = require('./User')(sequelize, DataTypes);
const Audiotrack = require('./Audiotrack')(sequelize, DataTypes);
const Artist = require('./Artist')(sequelize, DataTypes);

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
    sequelize,
    User,
    Audiotrack,
    Artist
};