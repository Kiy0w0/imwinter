const Sequelize = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    userId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    bio: {
        type: Sequelize.TEXT,
        defaultValue: 'No bio set.',
    },
    balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    xp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
});

module.exports = User;
