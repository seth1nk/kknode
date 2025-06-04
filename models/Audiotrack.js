module.exports = (sequelize, DataTypes) => {
    const Audiotrack = sequelize.define('Audiotrack', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, comment: 'ID аудиозаписи' },
        title: { type: DataTypes.STRING, allowNull: false, comment: 'Название трека' },
        artist: { type: DataTypes.STRING, allowNull: false, comment: 'Исполнитель' },
        album: { type: DataTypes.STRING, allowNull: true, comment: 'Альбом' },
        duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'Длительность (в секундах)' },
        genre: { type: DataTypes.STRING, allowNull: true, comment: 'Жанр трека' },
        play_count: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Количество воспроизведений' },
        release_year: { type: DataTypes.INTEGER, allowNull: true, comment: 'Год выпуска' },
        photo: { type: DataTypes.STRING, allowNull: true, comment: 'Путь к изображению' }
    }, {
        tableName: 'audiotracks',
        timestamps: false
    });
    return Audiotrack;
};