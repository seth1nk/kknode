module.exports = (sequelize, DataTypes) => {
    const Artist = sequelize.define('Artist', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, comment: 'ID исполнителя' },
        name: { type: DataTypes.STRING, allowNull: false, comment: 'Имя исполнителя' },
        bio: { type: DataTypes.TEXT, allowNull: true, comment: 'Биография' },
        country: { type: DataTypes.STRING, allowNull: true, comment: 'Страна' },
        genre: { type: DataTypes.STRING, allowNull: true, comment: 'Основной жанр' },
        formed_year: { type: DataTypes.INTEGER, allowNull: true, comment: 'Год основания/начала карьеры' },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true, comment: 'Активен' },
        label: { type: DataTypes.STRING, allowNull: true, comment: 'Музыкальный лейбл' },
        photo: { type: DataTypes.STRING, allowNull: true, comment: 'Путь к изображению' }
    }, {
        tableName: 'artists',
        timestamps: false
    });
    return Artist;
};